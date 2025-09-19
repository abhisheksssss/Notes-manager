"use client"
import axios, { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import React, { useEffect, useState, useCallback, useMemo } from "react"
import { toast } from "react-hot-toast"
import { Plus, Edit, Trash2, Save, X, Search, StickyNote, User, LogOut, Calendar } from "lucide-react"

interface Note {
  _id: string;
  userId: string;
  title: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  _id: string;
  email: string;
  username?: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Fixed interfaces to match your API responses
interface NotesResponse {
  data: Note[];  // Your API returns {data: fetchedData}
}

interface NoteResponse {
  data: Note;    // Your API returns {data: savedResponse}
}

interface DeleteResponse {
  data: string;  // Your API returns {data: "Deleted Successfully"}
}

const Page: React.FC = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState<boolean>(true);
  
  // Notes state management
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Form states
  const [newNote, setNewNote] = useState<{ title: string; notes: string }>({ title: '', notes: '' });
  const [editNote, setEditNote] = useState<{ title: string; notes: string }>({ title: '', notes: '' });

  // Memoized callbacks
  const handleNewNoteChange = useCallback((field: 'title' | 'notes', value: string) => {
    setNewNote(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEditNoteChange = useCallback((field: 'title' | 'notes', value: string) => {
    setEditNote(prev => ({ ...prev, [field]: value }));
  }, []);

  // Memoize filtered notes
  const filteredNotes = useMemo(() => 
    notes.filter(note =>
      note.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.title && note.title.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [notes, searchTerm]
  );

  const logOut = useCallback(async (): Promise<void> => {
    try {
      await axios.get("/api/users/logOut");
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
        toast.error(error.response?.data?.message || error.message);
      } else if (error instanceof Error) {
        console.log(error.message);
        toast.error(error.message);
      } else {
        console.log(error);
        toast.error("An unknown error occurred");
      }
    }
  }, [router]);

  const getUserDetails = useCallback(async (): Promise<void> => {
    try {
      setUserLoading(true);
      const res = await axios.get<ApiResponse<UserData>>("/api/users/me");
      setUserData(res.data.data);
      if (res.data.data._id) {
        await fetchNotes(res.data.data._id);
      }
    } catch (error) {
      console.error("Failed to get user details:", error);
      toast.error("Please login to continue");
      router.push("/login");
    } finally {
      setUserLoading(false);
    }
  }, [router]);

  // Fixed fetchNotes to match your API response structure
  const fetchNotes = useCallback(async (userId: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get<NotesResponse>(`/api/notes?userId=${userId}`);
      console.log("This is fetched response", response);
      
      // Your API returns {data: fetchedData} where fetchedData is the array
      const fetchedNotes = response.data.data;
      setNotes(Array.isArray(fetchedNotes) ? fetchedNotes : []);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.error || 'Failed to load notes');
      } else {
        toast.error('Failed to load notes');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fixed createNote to match your API response structure
  const createNote = useCallback(async (): Promise<void> => {
    if (!newNote.notes.trim()) {
      toast.error('Note content is required');
      return;
    }

    if (!userData?._id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post<NoteResponse>('/api/notes', {
        userId: userData._id,
        title: newNote.title || 'Untitled',
        notes: newNote.notes
      });
      
      console.log("This is the response", response);
      
      // Your API returns {data: savedResponse} where savedResponse is the created note
      const createdNote = response.data.data;
      setNotes(prev => [createdNote, ...prev]);
      setNewNote({ title: '', notes: '' });
      setIsAddingNote(false);
      toast.success('Note created successfully!');
    } catch (error) {
      console.error('Failed to create note:', error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.error || 'Failed to create note');
      } else {
        toast.error('Failed to create note');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [newNote, userData]);

  // Fixed updateNote to match your API response structure  
  const updateNote = useCallback(async (noteId: string): Promise<void> => {
    if (!editNote.notes.trim()) {
      toast.error('Note content is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.put<NoteResponse>(`/api/notes`, {
        noteId: noteId,
        title: editNote.title || 'Untitled',
        notes: editNote.notes
      });
      
      // Your API returns {data: fetchedData} where fetchedData is the updated note
      const updatedNote = response.data.data;
      setNotes(prev => prev.map(note => 
        note._id === noteId ? updatedNote : note
      ));
      
      setEditingNoteId(null);
      setEditNote({ title: '', notes: '' });
      toast.success('Note updated successfully!');
    } catch (error) {
      console.error('Failed to update note:', error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.error || 'Failed to update note');
      } else {
        toast.error('Failed to update note');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [editNote]);

  // Fixed deleteNote to match your API response structure
  const deleteNote = useCallback(async (noteId: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      console.log("This is note id", noteId);
      
      const response = await axios.delete<DeleteResponse>(`/api/notes?noteId=${noteId}`);
      
      // Check if deletion was successful based on your API response
      if (response.data.data === "Deleted Sucessfully" || response.status === 200) {
        setNotes(prev => prev.filter(note => note._id !== noteId));
        toast.success('Note deleted successfully!');
      } else {
        toast.error('Failed to delete note');
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.error || 'Failed to delete note');
      } else {
        toast.error('Failed to delete note');
      }
    }
  }, []);

  const startEditing = useCallback((note: Note): void => {
    setEditingNoteId(note._id);
    setEditNote({ title: note.title || '', notes: note.notes });
  }, []);

  const cancelEditing = useCallback((): void => {
    setEditingNoteId(null);
    setEditNote({ title: '', notes: '' });
  }, []);

  const closeModal = useCallback((): void => {
    setIsAddingNote(false);
    setNewNote({ title: '', notes: '' });
  }, []);

  // Format date
  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Auto-load user details on component mount
  useEffect(() => {
    getUserDetails();
  }, [getUserDetails]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal Overlay */}
      {isAddingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <StickyNote className="h-6 w-6 text-indigo-600 mr-2" />
                Create New Note
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                disabled={isSubmitting}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="noteTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Title (Optional)
                </label>
                <input
                  id="noteTitle"
                  type="text"
                  placeholder="Enter note title..."
                  value={newNote.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleNewNoteChange('title', e.target.value)
                  }
                  className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="noteContent" className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  id="noteContent"
                  placeholder="Write your note here..."
                  value={newNote.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    handleNewNoteChange('notes', e.target.value)
                  }
                  rows={6}
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={createNote}
                disabled={!newNote.notes.trim() || isSubmitting}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  !newNote.notes.trim() || isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                }`}
              >
                <Save className="h-4 w-4 mr-2 inline" />
                {isSubmitting ? 'Creating...' : 'Create Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
                  <p className="text-gray-600">{userData?.email || 'User Dashboard'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* {userData?._id && (
                  <Link 
                    href={`/profile/${userData._id}`}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
                  >
                    View Profile
                  </Link>
                )} */}
                <button 
                  onClick={logOut}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Notes Dashboard */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Dashboard Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <StickyNote className="h-8 w-8" />
                  <div>
                    <h2 className="text-2xl font-bold">My Notes</h2>
                    <p className="text-indigo-100">Manage your personal notes</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium">{notes.length} Notes</span>
                  </div>
                  <button
                    onClick={() => setIsAddingNote(true)}
                    className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-200 shadow-lg"
                    disabled={isSubmitting}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Note
                  </button>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            {notes.length > 0 && (
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="relative max-w-md">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search your notes..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>
            )}

            {/* Notes List */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your notes...</p>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-12">
                  <StickyNote className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'No notes found' : 'No notes yet'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm 
                      ? 'Try adjusting your search terms.' 
                      : 'Create your first note to get started!'
                    }
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setIsAddingNote(true)}
                      className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Note
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredNotes.map((note: Note) => (
                    <div key={note._id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-indigo-300">
                      {editingNoteId === note._id ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={editNote.title}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                              handleEditNoteChange('title', e.target.value)
                            }
                            className="w-full px-3 text-black py-2 text-sm font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Note title"
                            disabled={isSubmitting}
                          />
                          <textarea
                            value={editNote.notes}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                              handleEditNoteChange('notes', e.target.value)
                            }
                            rows={5}
                            className="w-full px-3 py-2 text-black text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                            disabled={isSubmitting}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateNote(note._id)}
                              disabled={isSubmitting || !editNote.notes.trim()}
                              className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              {isSubmitting ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={isSubmitting}
                              className="flex items-center px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 disabled:bg-gray-300"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <div className="mb-4">
                            <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                              {note.title || 'Untitled'}
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                              {note.notes.length > 150 ? `${note.notes.substring(0, 150)}...` : note.notes}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(note.updatedAt)}
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEditing(note)}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                                title="Edit note"
                                disabled={isSubmitting}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteNote(note._id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Delete note"
                                disabled={isSubmitting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page;
