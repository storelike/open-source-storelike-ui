import CalToActionForm from "../../../../components/react-components/call-to-action-icon-react/form-call-to-action";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const CallToActionPage: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState(true);
    const navigate = useNavigate();
    const formRef = useRef<HTMLDivElement>(null); // Реф для формы

    useEffect(() => {
        // Прокрутка к форме, когда страница загружается
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [isFormOpen]);

    const handleClose = (formData: { name: string; phone: string; email: string; message: string }) => {
        // Проверяем, заполнены ли поля
        const isFormEmpty = !formData.name?.trim() || 
        !formData.phone?.trim() || 
        !formData.email?.trim() || 
        !formData.message?.trim() || 
        (formData.phone && formData.phone.replace(/\D/g, '').length < 12);


        setIsFormOpen(false);

        if (isFormEmpty) {
            // Если форма пустая, перенаправляем на главную
            window.location.href = '/'
        } else {
            // Если форма заполнена, перенаправляем на страницу "Спасибо"
            navigate("/thank-you-page", { state: { formData } }); // Передаем данные через состояние
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen relative">
            {isFormOpen && (
                <div ref={formRef} className="w-full h-full max-w-md"> {/* Присваиваем реф */}
                    <CalToActionForm onClose={handleClose} />
                </div>
            )}
        </div>
    );
};

export default CallToActionPage;
