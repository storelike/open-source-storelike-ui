import CalToActionForm from "../../call-to-action-icon-react/form-call-to-action";
import  { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

const CallToActionPage = () => {
    const [isFormOpen, setIsFormOpen] = useState(true);
    const navigate = useNavigate();
    const formRef = useRef<HTMLDivElement>(null); // Ref for the form

    useEffect(() => {
        // Scroll to the form when the page loads
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [isFormOpen]);

    const handleClose = (formData: { name: string; phone: string; email: string; message: string }) => {
        // Check whether the fields are filled in
        const isFormEmpty = !formData.name?.trim() || 
        !formData.phone?.trim() || 
        !formData.email?.trim() || 
        !formData.message?.trim() || 
        (formData.phone && formData.phone.replace(/\D/g, '').length < 12);


        setIsFormOpen(false);

        if (isFormEmpty) {
            // If the form is empty, redirect to the home page
            window.location.href = '/'
        } else {
            // If the form is filled in, redirect to the "Thank you" page
            navigate("/thank-you-page", { state: { formData } }); // Pass the data via router state
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen relative">
            {isFormOpen && (
                <div ref={formRef} className="w-full h-full max-w-md"> {/* Assign the ref */}
                    <CalToActionForm onClose={handleClose} />
                </div>
            )}
        </div>
    );
};

export default CallToActionPage;
