import { Input } from "@/components/ui/input"

export function Search(){
    return (
        <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 " />
              <Input
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-white"
                placeholder="Search..."
                type="search"
              />
            </div>
          </form>
    )
}

function SearchIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    )
  }
  