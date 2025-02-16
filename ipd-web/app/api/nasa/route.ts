import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(request: Request) {
    // Parse the query parameters from the request URL
    const { searchParams } = new URL(request.url);

    // Get parameter values or fallback to defaults
    const start = searchParams.get("start") || "20180101";
    const end = searchParams.get("end") || "20241231";
    const latitude = searchParams.get("latitude") || "19.6565";
    const longitude = searchParams.get("longitude") || "73.1556";
    const community = searchParams.get("community") || "RE";
    const parameters =
        searchParams.get("parameters") ||
        "ALLSKY_SFC_SW_DWN,ALLSKY_SFC_SW_DNI,ALLSKY_SFC_SW_DIFF,SZA,ALLSKY_KT,T2M,PS,WS10M,WS50M,WD10M,WD50M";
    const formatType = searchParams.get("format") || "CSV";
    const theme = searchParams.get("theme") || "dark";
    const user = searchParams.get("user") || "DAVE";
    const timeStandard = searchParams.get("time-standard") || "LST";

    // Construct the NASA POWER API URL
    const nasaUrl =
        `https://power.larc.nasa.gov/api/temporal/hourly/point?start=${start}&end=${end}` +
        `&latitude=${latitude}&longitude=${longitude}` +
        `&community=${community}&parameters=${parameters}` +
        `&format=${formatType}&theme=${theme}` +
        `&user=${user}&time-standard=${timeStandard}`;

    // Define the directory and file name where you want to save the CSV
    const destinationDir = "/home/ninet33n/Desktop/ctrl/IPD_Final/Datasets";
    const fileName = `nasa_power_data_${latitude}_${longitude}.csv`;
    const filePath = path.join(destinationDir, fileName);

    try {
        // Ensure the destination directory exists (creates it if necessary)
        await fs.mkdir(destinationDir, { recursive: true });

        // Fetch the CSV data from NASA
        const response = await fetch(nasaUrl);
        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch data from NASA POWER API" },
                { status: response.status },
            );
        }
        const csvData = await response.text();

        // Save the CSV data to the specified file
        await fs.writeFile(filePath, csvData, "utf-8");

        // Return the CSV data with proper headers for download
        return new NextResponse(csvData, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": 'attachment; filename="nasa_data.csv"',
            },
        });
    } catch (error: any) {
        console.error("Error in API route:", error);
        return NextResponse.json(
            { error: error.message || "Unknown error" },
            { status: 500 },
        );
    }
}
