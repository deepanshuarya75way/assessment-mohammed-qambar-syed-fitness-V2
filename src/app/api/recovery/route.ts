import {NextRespose} from "next/server";
import clientPromise from "@/lib/mongodb";
import { getSession } from "@/lib/auth"; 

const score = (volume: number, soreness:number) => Math.max(0, Math.min(100, Math.round(100 - Math.min(60, volume/1000 * 50)- soreness*10)));

export async function GET() {
  try{
    const session = await getSession() as any;
    if(!session?.user?.id){
      return NextRespose.json({error: "Unauthorized"}, { status: 401});
    }

    const client = await clientPromise;
    const db = ("svora_db");
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate()- 13);
    start.setHours(0,0,0,0);

    const entries = await db.collection("journal_entries").find({
      userId: session.user.id, createdAt:{ $gte: start}
    }).sort({createdAt: -1}).toArray();
    const history = Array.from ({ length: 7}, (_,i)=> {
      const history = Array.from({length: 7})
    })
  }
}