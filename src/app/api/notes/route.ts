import { NextRequest, NextResponse } from "next/server";
import Notes from "@/model/notes.model"




export async function POST(request:NextRequest){
try {
    const data=await request.json();


    const{userId,notes,title}=data;
   
    console.log(userId,notes,title)

    const savedResponse= await Notes.create({
        userId:userId,
        title:title,
        notes:notes
    })

return NextResponse.json({data:savedResponse},{status:200})
} catch (error) {
 if(error instanceof Error){
    console.log(error)
    return NextResponse.json({error:error.message},{status:500})
 }    
}
}


export async function GET(request:NextRequest){
try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
   
    console.log(userId)

    const fetchedData = await Notes.find({ userId: userId });

    console.log(fetchedData)

    return NextResponse.json({ data: fetchedData }, { status: 200 });
} catch (error) {
    if (error instanceof Error) {
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }    
}
}



export async function PUT(request:NextRequest){
    try {
      const data= await request.json()

      const {noteId,title,notes}=data;

        const fetchedData = await Notes.findByIdAndUpdate(
            {_id:noteId},
            { title: title, notes: notes },
            { new: true, runValidators: true }
        );

return NextResponse.json({ data: fetchedData }, { status: 200 });

    } catch (error) {
         if (error instanceof Error) {
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }  
    }
}


export async function DELETE(request:NextRequest){
try {
    const {searchParams}= new URL(request.url)
const noteId=searchParams.get("noteId")

console.log("This is the note id",noteId)

const deleteing= await Notes.findByIdAndDelete(
    {_id:noteId}
)

if(deleteing){
        return NextResponse.json({ data:"Deleted Sucessfully"}, { status: 200 })
}else{
        return NextResponse.json({ data:"Error in deleting"}, { status: 400 })
}




} catch (error) {
    if(error instanceof Error){
        console.log(error)
     return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
}