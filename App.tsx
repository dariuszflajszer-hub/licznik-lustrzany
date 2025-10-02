import React, { useState, useEffect, useRef } from 'react';

const App: React.FC = () => {
    const [inputValue, setInputValue] = useState<string>('');
    const [displayNumber, setDisplayNumber] = useState<string | null>(null);
    const [isMirrored, setIsMirrored] = useState<boolean>(false);
    const [isRotated, setIsRotated] = useState<boolean>(false); // For 180-degree (upside-down) rotation
    const [isPortrait, setIsPortrait] = useState<boolean>(false); // For 90-degree (portrait) rotation
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Only run effects when a number is being displayed
        if (displayNumber === null) {
            return;
        }

        // Mirroring interval
        const intervalId = setInterval(() => {
            setIsMirrored(prevIsMirrored => !prevIsMirrored);
        }, 2000);
        
        // --- Orientation detection logic ---
        const handleResizeAndOrientation = () => {
            // Check for upside-down rotation (180 degrees)
            setIsRotated(window.screen.orientation.angle === 180);
            // Check for portrait vs landscape for 90-degree rotation
            setIsPortrait(window.innerHeight > window.innerWidth);
        };
        
        // Set initial state
        handleResizeAndOrientation();

        // Add listeners for orientation and resize changes
        window.screen.orientation.addEventListener('change', handleResizeAndOrientation);
        window.addEventListener('resize', handleResizeAndOrientation);
        // --- End of orientation logic ---

        // Cleanup function to clear interval and listeners
        return () => {
            clearInterval(intervalId);
            window.screen.orientation.removeEventListener('change', handleResizeAndOrientation);
            window.removeEventListener('resize', handleResizeAndOrientation);
            setIsMirrored(false); // Reset mirror state
            setIsRotated(false); // Reset rotation state
            setIsPortrait(false); // Reset portrait state
        };
    }, [displayNumber]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Restrict input to only digits and a maximum length of 3
        if (/^\d*$/.test(value) && value.length <= 3) {
            setInputValue(value);
            // Automatically switch to display view when 3 digits are entered
            if (value.length === 3) {
                setDisplayNumber(value);
            }
        }
    };

    const handleClearInput = () => {
        setInputValue('');
        inputRef.current?.focus(); // Keep the input focused for immediate re-entry
    };

    const handleReturnToInput = () => {
        setDisplayNumber(null);
        setInputValue(''); // Clear the input value upon returning
    };

    // Render the number display view when a number has been set
    if (displayNumber) {
        // Combine all transform classes for a clean application
        const transformClasses = [];
        if (isPortrait) transformClasses.push('rotate-90');
        if (isRotated) transformClasses.push('rotate-180');
        if (isMirrored) transformClasses.push('scale-x-[-1]');

        return (
            <div
                className="relative w-screen h-screen bg-black text-white flex items-center justify-center cursor-pointer select-none overflow-hidden"
                onClick={handleReturnToInput}
                title="Dotknij, aby wrócić do wprowadzania liczby"
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent the parent div's onClick from firing
                        handleReturnToInput();
                    }}
                    className="absolute top-4 right-6 text-red-600 hover:text-red-400 font-black text-6xl z-10 transition-colors duration-200 leading-none"
                    aria-label="Zamknij i wróć do wprowadzania"
                    title="Zamknij"
                >
                    &times;
                </button>
                {/* This wrapper div handles all rotations and mirroring */}
                <div className={`transition-transform duration-500 ease-in-out ${transformClasses.join(' ')}`}>
                    <span
                        className="font-bold text-center block"
                        style={{
                            // Increased vmin to better fill the screen's shorter dimension
                            fontSize: 'clamp(100px, 75vmin, 900px)',
                            lineHeight: 1,
                            borderBottom: '6px solid #a0aec0', // gray-400 for the underline
                            paddingBottom: '0.05em'
                        }}
                    >
                        {displayNumber}
                    </span>
                </div>
            </div>
        );
    }

    // Render the input view
    return (
        <div className="w-screen h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-gray-300">Wprowadź 3-cyfrową liczbę</h1>
            <input
                ref={inputRef}
                type="tel" // Use 'tel' for a numeric keypad on mobile devices
                value={inputValue}
                onChange={handleInputChange}
                autoFocus
                className="bg-gray-800 border-2 border-gray-600 text-white text-5xl sm:text-7xl text-center rounded-lg w-full max-w-xs p-4 tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={3}
                placeholder="___"
            />
            <button
                onClick={handleClearInput}
                className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors duration-200"
            >
                Wyczyść
            </button>
        </div>
    );
};

export default App;
