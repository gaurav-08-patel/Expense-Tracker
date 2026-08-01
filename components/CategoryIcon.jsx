import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { CATEGORIES } from "../constants/categories";

const iconSets = {
    Feather,
    MaterialCommunityIcons,
};

function CategoryIcon({ categoryId, size = 20 }) {
    const category =
        CATEGORIES.find((c) => c.id === categoryId) ||
        CATEGORIES.find((c) => c.id === "other");

    if (!category) {
        return null;
    }

    const IconComponent = iconSets[category.iconSet] || Feather;
    return (
        <IconComponent
            name={category.icon || "more-horizontal"}
            size={size}
            color={category.color}
        />
    );
}

export { CategoryIcon };
export default CategoryIcon;
