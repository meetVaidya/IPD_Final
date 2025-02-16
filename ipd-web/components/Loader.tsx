"use client";

export default function Loader() {
    return (
        <div className="loader-overlay">
            <div className="spinner" />
            <p>Processing, please wait...</p>
            <style jsx>{`
                .loader-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.7);
                    z-index: 9999;
                }
                .spinner {
                    border: 8px solid #f3f3f3;
                    border-top: 8px solid #3498db;
                    border-radius: 50%;
                    width: 60px;
                    height: 60px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
                p {
                    margin-top: 1rem;
                    font-size: 1.2rem;
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
}
