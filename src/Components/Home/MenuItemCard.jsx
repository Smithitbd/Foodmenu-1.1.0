// components/MenuItemCard.jsx
import { Link } from "react-router";
import SkeletonImage from "../Shared/SkeletonImage";

const MenuItemCard = ({ item }) => {
    return (
        <div className="flex flex-col items-center group">
            <Link to={`/${item.id}`} className="block">
                <SkeletonImage
                    src={item.logo}
                    alt={item.name}
                    className="w-28 h-28 sm:w-36 sm:h-36 lg:w-48 lg:h-48 object-cover 
                     rounded-2xl shadow-xl hover:shadow-2xl transition-all 
                     duration-300 group-hover:scale-105"
                />
            </Link>

            <p className="mt-3 font-bold text-gray-800 text-base sm:text-lg">
                {item.name}
            </p>
        </div>
    );
};

export default MenuItemCard;
