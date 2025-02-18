"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loader from "@/components/Loader";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

export default function EvaluationPage() {
    // Keep track of the file path input.
    const [filepath, setFilepath] = useState("");
    // Store the evaluation results returned from the backend.
    const [evaluationResults, setEvaluationResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Handler that calls the /evaluate endpoint.
    const handleEvaluate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!filepath) {
            setMessage("Please enter a CSV file path.");
            return;
        }
        setMessage("");
        setLoading(true);

        try {
            // Make sure the backend URL is correct.
            const response = await fetch(
                `http://localhost:8000/evaluate?filepath=${encodeURIComponent(filepath)}`,
            );
            if (!response.ok) {
                const errorData = await response.json();
                setMessage(errorData.detail || "Error evaluating CSV file.");
                setLoading(false);
                return;
            }
            const data = await response.json();
            setEvaluationResults(data);
        } catch (error) {
            console.error("Error fetching evaluation results:", error);
            setMessage("An error occurred while fetching evaluation results.");
        } finally {
            setLoading(false);
        }
    };

    // Create chart data from the returned plot data.
    let chartData = [];
    if (evaluationResults && evaluationResults.plot) {
        const { x, y } = evaluationResults.plot;
        chartData = x.map((actual: number, i: number) => ({
            actual,
            predicted: y[i],
        }));
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">ML Evaluation Results</h1>

            <form onSubmit={handleEvaluate} className="mb-4 space-y-4">
                <div>
                    <Label htmlFor="filepath">CSV File Path</Label>
                    <Input
                        id="filepath"
                        value={filepath}
                        onChange={(e) => setFilepath(e.target.value)}
                        placeholder="/path/to/cleaned_data.csv"
                    />
                </div>
                <Button type="submit" disabled={loading}>
                    Evaluate CSV
                </Button>
            </form>

            {message && <p className="text-red-600">{message}</p>}

            {loading && <Loader />}

            {evaluationResults && !loading && (
                <div>
                    <h2 className="text-xl font-semibold mt-4">
                        Evaluation Metrics:
                    </h2>
                    <ul className="list-disc ml-6">
                        <li>
                            RMSE: {evaluationResults.evaluation_metrics.RMSE}
                        </li>
                        <li>MAE: {evaluationResults.evaluation_metrics.MAE}</li>
                        <li>R2: {evaluationResults.evaluation_metrics.R2}</li>
                    </ul>

                    <h2 className="text-xl font-semibold mt-4">
                        Predictions vs. Actual Values
                    </h2>
                    <table className="min-w-full border">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2">Actual</th>
                                <th className="border px-4 py-2">Predicted</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chartData.map((item: any, index: number) => (
                                <tr key={index}>
                                    <td className="border px-4 py-2">
                                        {item.actual}
                                    </td>
                                    <td className="border px-4 py-2">
                                        {item.predicted}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h2 className="text-xl font-semibold mt-4">
                        Actual vs. Predicted Plot
                    </h2>
                    <LineChart width={600} height={300} data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="actual"
                            label={{
                                value: "Actual",
                                position: "insideBottom",
                                offset: -5,
                            }}
                        />
                        <YAxis
                            label={{
                                value: "Predicted",
                                angle: -90,
                                position: "insideLeft",
                            }}
                        />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="actual"
                            stroke="#8884d8"
                            name="Actual"
                        />
                        <Line
                            type="monotone"
                            dataKey="predicted"
                            stroke="#82ca9d"
                            name="Predicted"
                        />
                    </LineChart>
                </div>
            )}
        </div>
    );
}
