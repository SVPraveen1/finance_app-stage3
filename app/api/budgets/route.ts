import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("finance-stage3")

    const budgets = await db.collection("budgets").find({}).toArray()

    return NextResponse.json(budgets)
  } catch (error) {
    console.error("Error fetching budgets:", error)
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { category, amount } = await request.json()

    const client = await clientPromise
    const db = client.db("finance-stage3")

    // Check if budget for this category already exists
    const existingBudget = await db.collection("budgets").findOne({ category })

    if (existingBudget) {
      return NextResponse.json({ error: "A budget for this category already exists" }, { status: 400 })
    }

    const result = await db.collection("budgets").insertOne({
      category,
      amount,
    })

    const insertedId = result.insertedId

    const insertedBudget = await db.collection("budgets").findOne({ _id: insertedId })

    return NextResponse.json(insertedBudget, { status: 201 })
  } catch (error) {
    console.error("Error creating budget:", error)
    return NextResponse.json({ error: "Failed to create budget" }, { status: 500 })
  }
}

