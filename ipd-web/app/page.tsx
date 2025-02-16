"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Loader from "@/components/Loader"; // import the Loader component

export default function Home() {
    // Set form states
    const [startDate, setStartDate] = useState<Date | null>(
        new Date("2018-01-01"),
    );
    const [endDate, setEndDate] = useState<Date | null>(new Date("2024-12-31"));
    const [latitude, setLatitude] = useState("19.6565");
    const [longitude, setLongitude] = useState("73.1556");
    const [community, setCommunity] = useState("RE");
    const [parameters, setParameters] = useState(
        "ALLSKY_SFC_SW_DWN,ALLSKY_SFC_SW_DNI,ALLSKY_SFC_SW_DIFF,SZA,ALLSKY_KT,T2M,PS,WS10M,WS50M,WD10M,WD50M",
    );
    const [formatType, setFormatType] = useState("CSV");
    const [theme, setTheme] = useState("dark");
    const [user, setUser] = useState("DAVE");
    const [timeStandard, setTimeStandard] = useState("LST");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false); // loading state

    const formatDateToString = (date: Date) => format(date, "yyyyMMdd");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!startDate || !endDate) {
            setMessage("Please select both start and end dates");
            return;
        }
        setMessage("");
        setLoading(true); // show loader

        const start = formatDateToString(startDate);
        const end = formatDateToString(endDate);

        // Build the query string for the NASA API route
        const queryParams = new URLSearchParams({
            start,
            end,
            latitude,
            longitude,
            community,
            parameters,
            format: formatType,
            theme,
            user,
            "time-standard": timeStandard,
        });
        const nasaApiUrl = `/api/nasa?${queryParams.toString()}`;

        try {
            // Fetch data from your Next.js API route (which saves the CSV)
            const response = await fetch(nasaApiUrl);
            if (!response.ok) {
                throw new Error("Failed to fetch data from the server route");
            }
            // const csvData = await response.text();

            // (Optional) After fetching, you can automatically pass the CSV file path to FastAPI
            // if you adjusted your API to send the 'filePath' or similar info.
            // For example:
            //
            const filePath = `/home/ninet33n/Desktop/ctrl/IPD_Final/Datasets/nasa_power_data_${latitude}_${longitude}.csv`;
            const preprocessUrl = `http://localhost:8000/preprocess?filepath=${encodeURIComponent(filePath)}`;
            const preprocessResponse = await fetch(preprocessUrl);
            if (!preprocessResponse.ok) {
                throw new Error("Failed to process CSV in backend");
            }
            const cleanedCsvData = await preprocessResponse.text();
            // Optionally trigger a download of the cleaned CSV:

            const blob = new Blob([cleanedCsvData], { type: "text/csv" });
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `cleaned_data_${latitude}_${longitude}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            // Here, we automatically trigger the download of the originally fetched CSV.
            // const blob = new Blob([csvData], { type: "text/csv" });
            // const blobUrl = URL.createObjectURL(blob);
            // const a = document.createElement("a");
            // a.href = blobUrl;
            // a.download = `nasa_power_data_${latitude}_${longitude}.csv`;
            // document.body.appendChild(a);
            // a.click();
            // a.remove();

            // Optionally, revoke the object URL after some time
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);

            setMessage("Data fetched and file download has started.");
        } catch (error: any) {
            console.error("Error fetching data:", error);
            setMessage(error.message || "Failed to fetch data");
        } finally {
            setLoading(false); // hide loader when done
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">
                    NASA POWER API Data Fetcher
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="start">Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !startDate && "text-muted-foreground",
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate
                                        ? format(startDate, "PPP")
                                        : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <DateCalendar
                                    value={startDate}
                                    onChange={(newValue) =>
                                        newValue && setStartDate(newValue)
                                    }
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="end">End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !endDate && "text-muted-foreground",
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate
                                        ? format(endDate, "PPP")
                                        : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <DateCalendar
                                    value={endDate}
                                    onChange={(newValue) =>
                                        newValue && setEndDate(newValue)
                                    }
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div>
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                            id="latitude"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                            id="longitude"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="community">Community</Label>
                        <Input
                            id="community"
                            value={community}
                            onChange={(e) => setCommunity(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="parameters">Parameters</Label>
                        <Input
                            id="parameters"
                            value={parameters}
                            onChange={(e) => setParameters(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="format">Format</Label>
                        <Input
                            id="format"
                            value={formatType}
                            onChange={(e) => setFormatType(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="theme">Theme</Label>
                        <Input
                            id="theme"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="user">User</Label>
                        <Input
                            id="user"
                            value={user}
                            onChange={(e) => setUser(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="timeStandard">Time Standard</Label>
                        <Input
                            id="timeStandard"
                            value={timeStandard}
                            onChange={(e) => setTimeStandard(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit">Fetch Data</Button>
                </form>

                {message && <p className="mt-4">{message}</p>}
            </div>

            {loading && <Loader />}
        </LocalizationProvider>
    );
}
