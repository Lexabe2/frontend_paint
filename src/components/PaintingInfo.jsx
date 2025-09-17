import {useEffect, useState} from "react";
import api from "../api/axios.js";

export default function PaintingInfo() {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get("/dashboard/?source=paint");
                setData(response.data);
            } catch (error) {
                console.error("Ошибка при получении дашборда:", error);
            }
        };

        fetchDashboard();
    }, []);

    if (!data) return <p>Загрузка...</p>;

    return (
        <div>
            <h1>Главная</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}