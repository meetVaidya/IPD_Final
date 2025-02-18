"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import Loader from "@/components/Loader";
import MapSelector from "@/components/MapSelector";
// Import the shadcn useToast hook
import { useToast } from "@/hooks/use-toast";

export default function Home() {
    // Date inputs
    const [startDate, setStartDate] = useState<Date | null>(
        new Date("2018-01-01"),
    );
    const [endDate, setEndDate] = useState<Date | null>(new Date("2024-12-31"));

    // Other parameters – you can keep defaults or add new inputs as needed.
    const [community, setCommunity] = useState("RE");
    const [parameters, setParameters] = useState(
        "ALLSKY_SFC_SW_DWN,ALLSKY_SFC_SW_DNI,ALLSKY_SFC_SW_DIFF,SZA,ALLSKY_KT,T2M,PS,WS10M,WS50M,WD10M,WD50M",
    );
    const [formatType, setFormatType] = useState("CSV");
    const [theme, setTheme] = useState("dark");
    const [user, setUser] = useState("DAVE");
    const [timeStandard, setTimeStandard] = useState("LST");

    // We'll use one state for general messages.
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Marker state (each marker has a lat and lng)
    const [markers, setMarkers] = useState<{ lat: number; lng: number }[]>([]);

    const router = useRouter();
    const { toast } = useToast();

    const formatDateToString = (date: Date) => format(date, "yyyyMMdd");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Reset any previous messages.
        setMessage("");

        // Validation on user inputs
        if (!startDate || !endDate) {
            toast({
                title: "Missing Dates",
                description: "Please select both start and end dates.",
                variant: "destructive",
            });
            return;
        }
        if (endDate.getTime() < startDate.getTime()) {
            toast({
                title: "Invalid Date Range",
                description: "End date cannot be earlier than start date.",
                variant: "destructive",
            });
            return;
        }
        if (markers.length !== 4) {
            toast({
                title: "Map Selection",
                description: "Please select exactly 4 locations on the map.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        const start = formatDateToString(startDate);
        const end = formatDateToString(endDate);

        try {
            // For each marker, call the NASA API and then trigger preprocessing.
            await Promise.all(
                markers.map(async (marker) => {
                    const queryParams = new URLSearchParams({
                        start,
                        end,
                        latitude: marker.lat.toString(),
                        longitude: marker.lng.toString(),
                        community,
                        parameters,
                        format: formatType,
                        theme,
                        user,
                        "time-standard": timeStandard,
                    });
                    const nasaApiUrl = `/api/nasa?${queryParams.toString()}`;

                    // Call your Next.js API route which downloads and saves the CSV.
                    const response = await fetch(nasaApiUrl);
                    if (!response.ok) {
                        throw new Error(
                            `Failed to fetch data for location (${marker.lat},${marker.lng}).`,
                        );
                    }
                    // Optionally, trigger the FastAPI preprocessing.
                    const filePath = `/home/ninet33n/Desktop/ctrl/IPD_Final/Datasets/nasa_power_data_${marker.lat}_${marker.lng}.csv`;
                    const preprocessUrl = `http://localhost:8000/preprocess?filepath=${encodeURIComponent(
                        filePath,
                    )}`;
                    const preprocessResponse = await fetch(preprocessUrl);
                    if (!preprocessResponse.ok) {
                        throw new Error(
                            `Failed to process CSV for location (${marker.lat},${marker.lng}).`,
                        );
                    }
                    const cleanedCsvData = await preprocessResponse.text();

                    // Trigger the download of the cleaned CSV.
                    const blob = new Blob([cleanedCsvData], {
                        type: "text/csv",
                    });
                    const blobUrl = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = blobUrl;
                    a.download = `cleaned_data_${marker.lat}_${marker.lng}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();

                    // Optionally, revoke the blob URL after some time.
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
                }),
            );

            setMessage(
                "Data fetched and file downloads have started for all locations.",
            );
            toast({
                title: "Success",
                description:
                    "Data has been fetched and file downloads are starting.",
                variant: "default",
            });

            // For demonstration, navigate to the evaluation page (using file path from first marker).
            const firstMarker = markers[0];
            const filePath = `/home/ninet33n/Desktop/ctrl/IPD_Final/Datasets/nasa_power_data_${firstMarker.lat}_${firstMarker.lng}.csv`;
            router.push(`/evaluation?filepath=${encodeURIComponent(filePath)}`);
        } catch (err: any) {
            console.error("Error fetching data:", err);
            toast({
                title: "Data Fetch Error",
                description:
                    "Oops! Something went wrong while fetching the data. " +
                    (err.message || "Please try again later."),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
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

                    {/* Other inputs for community, parameters, etc. */}
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

                    {/* Map selector */}
                    <div className="my-4">
                        <MapSelector
                            onChange={(markers) => setMarkers(markers)}
                        />
                        <p className="text-sm text-gray-600">
                            Selected locations: {markers.length} of 4
                        </p>
                    </div>

                    <Button type="submit">Fetch Data for All Locations</Button>
                </form>

                {/* Friendly message for success */}
                {message && <p className="mt-4 text-green-500">{message}</p>}
            </div>

            {loading && <Loader />}
        </LocalizationProvider>
    );
}
