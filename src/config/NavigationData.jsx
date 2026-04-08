import {
    PackageCheck,
    Home,
    CirclePlus,
    MessageSquarePlus,
    Eye,
    CreditCard,
    Warehouse,
    Banknote,
    PencilRuler,
    Sticker,
} from "lucide-react"

export const navigationGroups = {
    group1: {
        label: "Склад",
        icon: PackageCheck,
        color: "from-blue-500 to-cyan-500",
        items: [
            {
                id: "dashboard",
                label: "Главная",
                icon: Home,
                color: "from-blue-500 to-cyan-500",
                permission: "dashboard",
                path: "/dashboard",
                category: 'warehouse'
            },
            {
                id: "warehouse",
                label: "Хранение",
                icon: Warehouse,
                color: "from-green-500 to-emerald-500",
                permission: "registration_receive_war",
                path: "/warehouse",
                category: 'warehouse'
            },
            {
                id: "signing",
                label: "Оприходование",
                icon: CirclePlus,
                color: "from-blue-500 to-cyan-500",
                permission: "signing",
                path: "/add_atm",
                category: 'warehouse'
            },
            {
                id: "add_req",
                label: "Создание заявки",
                icon: MessageSquarePlus,
                color: "from-blue-500 to-cyan-500",
                permission: "add_req",
                path: "/warehouse_atms",
                category: 'warehouse'
            },
            {
                id: "viewing_req",
                label: "Просмотр заявок",
                icon: Eye,
                color: "from-blue-500 to-cyan-500",
                permission: "viewing_req",
                path: "/viewing_req",
                category: 'warehouse'
            },
            {
                id: "viewing_atms",
                label: "Банкоматы",
                icon: Banknote,
                color: "from-green-500 to-emerald-500",
                permission: "registration_receive_war",
                path: "/viewing_atms",
                category: 'warehouse'
            },
            {
                id: "change_status_atm",
                label: "Статус банкомата",
                icon: PencilRuler,
                color: "from-green-500 to-emerald-500",
                permission: "registration_receive_war",
                path: "/change_status_atm",
                category: 'warehouse'
            },
            {
                id: "act",
                label: "Акты",
                icon: Sticker,
                color: "from-green-500 to-emerald-500",
                permission: "registration_receive_war",
                path: "/act",
                category: 'warehouse'
            },
        ],
    },
    group2: {
        label: "ПП",
        icon: CreditCard,
        color: "from-purple-500 to-pink-500",
        items: [
            {
                id: "dashboard",
                label: "Главная",
                icon: Home,
                color: "from-blue-500 to-cyan-500",
                permission: "dashboard",
                path: "/dashboard",
                category: 'pp'
            },
        ],
    },
}

const allPermissions = Object.values(navigationGroups)
    .flatMap(group => group.items.map(item => item.permission))

export const rolePermissions = {
    admin: allPermissions, // админ видит всё
    storekeeper: ["signing", "warehouse", "viewing_req", "registration_transfer_war", "registration_receive_war", "viewing_atms", "change_status_atm"],
    moderator: ['complaints', 'viewing_req', 'registration_transfer_war', 'registration_receive_war'],
}