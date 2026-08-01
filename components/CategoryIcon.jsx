import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { CATEGORIES } from "../constants/categories";

const iconSets = {
    Feather,
    MaterialCommunityIcons,
};

export function CategoryIcon({ categoryId, size = 20 }) {
    const category = CATEGORIES.find((c) => c.id === categoryId);
    if (!category) return null;

    const IconComponent = iconSets[category.iconSet];
    return (
        <IconComponent
            name={category.icon}
            size={size}
            color={category.color}
        />
    );
}
