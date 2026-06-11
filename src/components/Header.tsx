type props = {
    search: string;
    setSearch: (value: string) => void;
};
export default function Header({ search, setSearch }: props) {
    return (
        <>
            <header className="bg-black/50 backdrop-blur border-b border-white/10 p-4 sticky top-0 z-30">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        🎬 MyStreamZ
                    </h1>
                    <input
                        type="text"
                        placeholder="Search channels..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm focus:outline-none focus:border-purple-400 w-48 md:w-72"
                    />
                </div>
            </header>
        </>
    );
}
