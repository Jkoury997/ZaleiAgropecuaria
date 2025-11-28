import Link from "next/link"
import { EggFriedIcon} from "lucide-react"

export default function Brand ({title}) {

    return (
        <div className="flex h-[60px] items-center px-6">
          
            <Link className="flex items-center gap-2 font-semibold" href="/dashboard">
              <EggFriedIcon className="h-6 w-6" />
              <span className="">{title}</span>
            </Link>
        </div>
    )
}
