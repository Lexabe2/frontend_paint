import {
    PackageCheck,
    Home,
    CirclePlus,
    MessageSquarePlus,
    Eye,
    FolderPlus,
    CreditCard,
    ClipboardIcon,
    FileWarning
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
                id: "registration_transfer",
                label: "Передача",
                icon: PackageCheck,
                color: "from-green-500 to-emerald-500",
                permission: "registration_transfer_war",
                path: "/registration?group=warehouse",
                category: 'warehouse'
            },
            {
                id: "registration_receive",
                label: "Получение",
                icon: FolderPlus,
                color: "from-green-500 to-emerald-500",
                permission: "registration_receive_war",
                path: "/registration?group=warehouse",
                category: 'warehouse'
            },
        ],
    },
    group2: {
        label: "Покрасочная",
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
                category: 'painting'
            },
            {
                id: "application",
                label: "Заявки",
                icon: ClipboardIcon,
                color: "from-purple-500 to-pink-500",
                permission: "application",
                path: "/application",
                category: 'painting'
            },
            {
                id: "registration",
                label: "Приемка",
                icon: PackageCheck,
                color: "from-green-500 to-emerald-500",
                permission: "registration",
                path: "/registration?group=paint",
                category: 'painting'
            },
            {
                id: "atm",
                label: "Устройства",
                icon: CreditCard,
                color: "from-orange-500 to-red-500",
                permission: "atm",
                path: "/atm",
                category: 'painting'
            },
            {
                id: "complaints",
                label: "Рекламации",
                icon: FileWarning,
                color: "from-indigo-500 to-purple-500",
                permission: "complaints",
                path: "/complaints",
                category: 'painting'
            },
        ],
    },
}

const allPermissions = Object.values(navigationGroups)
    .flatMap(group => group.items.map(item => item.permission))

export const rolePermissions = {
    admin: allPermissions, // админ видит всё
    admin_paint: ["dashboard", "application", "registration", "atm", "complaints"],
    storekeeper: ["signing", "viewing_req", "registration_transfer_war", "registration_receive_war"]
}