import { useState, useRef, useEffect } from 'react';

const Dropdown = ({ items, placeholder, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef();

  const handleSelect = (item) => {
    setSelectedItem(item);
    onSelect(item);
    setIsOpen(false);
    setSearchTerm(''); // Reset search term
  };

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative inline-block text-left">
        <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          id="options-menu"
          aria-haspopup="true"
          aria-expanded="true"
        >
          {selectedItem || placeholder}
          {/* Other components and code */}
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <input
              className="px-4 py-2 w-full text-sm"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="max-h-60 overflow-y-auto">
              {filteredItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(item)}
                  className="text-gray-700 block px-4 py-2 text-sm w-full text-left"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
