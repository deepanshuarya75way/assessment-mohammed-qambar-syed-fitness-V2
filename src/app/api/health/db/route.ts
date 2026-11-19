import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';


export async function GET(){
  try{
    const client = await clientPromise;
    await client.db("svora_db").command({ping : 1});
    return NextResponse.json({
      success: true,
      database: "connected",
      name: "svora_db",
    });
  }
    catch(error){
      console.error("MongoDB connection Failed :", error);
      return NextResponse.json({
        success: false,
        database: "disconnected"}, {status: 500}
      );
    }
  }
