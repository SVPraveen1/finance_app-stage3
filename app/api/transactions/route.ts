import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("finance-stage3")

    const transactions = await db.collection("transactions").find({}).sort({ date: -1 }).toArray()

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { amount, date, description, category } = await request.json()

    const client = await clientPromise
    const db = client.db("finance-stage3")

    const result = await db.collection("transactions").insertOne({
      amount,
      date,
      description,
      category,
    })

    const insertedId = result.insertedId

    const insertedTransaction = await db.collection("transactions").findOne({ _id: insertedId })

    return NextResponse.json(insertedTransaction, { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}

