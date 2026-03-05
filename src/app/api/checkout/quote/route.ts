import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getStudentEligibility } from "@/lib/student-discount";

// CONSTANTS
const STUDENT_DISCOUNT_PERCENTAGE = 0.10; // 10% discount

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a real application, you would parse the body to calculate the base total
    // based on cart items, quantities, etc.
    // Dummmy base total for this example:
    const baseTotal = 100.00;
    
    // Check student eligibility
    const eligibility = await getStudentEligibility(userId);
    
    let finalTotal = baseTotal;
    let discountApplied = false;
    let discountReason = 'not_eligible';

    if (eligibility.active) {
      finalTotal = baseTotal * (1 - STUDENT_DISCOUNT_PERCENTAGE);
      discountApplied = true;
      discountReason = 'student_active';
    } else if (eligibility.expires_at) {
        discountReason = 'expired';
    }

    return NextResponse.json({
      total: finalTotal,
      baseTotal: baseTotal,
      discount_applied: discountApplied,
      discount_reason: discountReason,
    });

  } catch (error) {
    console.error("Checkout quote error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
