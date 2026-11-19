
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getSession } from "@/lib/auth";

const score = (volume: number, soreness: number) =>
  Math.max(
    0,
    Math.min(
      100,
      Math.round(100 - Math.min(60, (volume / 1000) * 50) - soreness * 10)
    )
  );

export async function GET() {
  try {
    const session = (await getSession()) as any;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("svora_db");

    const now = new Date();
    const start = new Date(now);

    start.setDate(start.getDate() - 13);
    start.setHours(0, 0, 0, 0);

    const entries = await db
      .collection("journal_entries")
      .find({
        userId: session.user.id,
        createdAt: { $gte: start },
      })
      .sort({ createdAt: -1 })
      .toArray();

    const history = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(now);

      day.setDate(day.getDate() - (6 - i));
      day.setHours(0, 0, 0, 0);

      const weekStart = new Date(day);
      weekStart.setDate(weekStart.getDate() - 6);

      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const volume = entries
        .filter(
          (e) =>
            e.type === "workout" &&
            new Date(e.createdAt) >= weekStart &&
            new Date(e.createdAt) < nextDay
        )
        .reduce(
          (sum, e) => sum + Number(e.volume || 0),
          0
        );

      const checkin = entries.find(
        (e) =>
          e.type === "soreness" &&
          new Date(e.createdAt).toDateString() === day.toDateString()
      );

      return {
        date: day.toISOString().slice(5, 10),
        score: score(volume, Number(checkin?.soreness || 0)),
        volume,
      };
    });

    const today = history[6];

    const level =
      today.score >= 75
        ? "Ready"
        : today.score >= 45
        ? "Moderate"
        : "Rest";

    return NextResponse.json({
      ...today,
      level,
      advice:
        level === "Rest"
          ? "High Fatigue"
          : level === "Moderate"
          ? "Reduce intensity"
          : "You appear ready to train",
      history,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Recovery calculation failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = (await getSession()) as any;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { soreness } = await req.json();

    if (![1, 2, 3].includes(soreness)) {
      return NextResponse.json(
        { error: "INVALID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;

    await client
      .db("svora_db")
      .collection("journal_entries")
      .insertOne({
        userId: session.user.id,
        type: "soreness",
        soreness,
        createdAt: new Date(),
      });

    return NextResponse.json({
      success: true,
      message: "Check-in saved successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Check-in Failed" },
      { status: 500 }
    );
  }
}
