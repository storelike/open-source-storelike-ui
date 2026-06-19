export function DevelopedBy() {
    return (
        <div className="hidden flex space-x-4 text-sm">
            {/* "Code" link with enhanced styling */}
            <a
                href="https://buildberries.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
                Code
            </a>

            <span className="border-r border-gray-300 h-6"></span> {/* Taller divider so it stays visible */}
            
            {/* "oX1c.ru" link with enhanced styling */}
            <a
                href="https://storelike.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
                oX1c.ru
            </a>
        </div>
    );
}
