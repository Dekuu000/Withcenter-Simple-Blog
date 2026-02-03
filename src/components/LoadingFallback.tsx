export default function LoadingFallback() {
    return (
        <div className="flex justify-center items-center min-h-[400px] py-20">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-secondary/30 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-brand-dark/60 font-medium">Loading...</p>
            </div>
        </div>
    );
}
