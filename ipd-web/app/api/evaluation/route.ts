import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // Extract the query parameter.
    const { searchParams } = new URL(request.url);
    const filepath = searchParams.get("filepath");
    if (!filepath) {
        return NextResponse.json(
            { error: "Missing filepath parameter" },
            { status: 400 },
        );
    }

    // Build the FastAPI evaluation URL.
    const fastApiUrl = `http://localhost:8000/evaluate?filepath=${encodeURIComponent(filepath)}`;

    try {
        const response = await fetch(fastApiUrl);
        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: "FastAPI error", detail: errorText },
                { status: response.status },
            );
        }
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Server error", detail: error.message },
            { status: 500 },
        );
    }
}
