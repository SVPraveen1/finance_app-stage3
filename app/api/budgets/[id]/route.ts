import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { amount } = await request.json()

    const client = await clientPromise
    const db = client.db("finance-stage3")

    const result = await db.collection("budgets").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          amount,
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    const updatedBudget = await db.collection("budgets").findOne({ _id: new ObjectId(id) })

    return NextResponse.json(updatedBudget)
  } catch (error) {
    console.error("Error updating budget:", error)
    return NextResponse.json({ error: "Failed to update budget" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const client = await clientPromise
    const db = client.db("finance-stage3")

    const result = await db.collection("budgets").deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting budget:", error)
    return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 })
  }
}

