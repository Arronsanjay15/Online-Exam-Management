import { useEffect } from "react";

import { XIcon } from "./Icons";

// =============================================
// SHARED MODAL
// A small, accessible popup used for confirmations
// and result messages. Closes on overlay click or
// the Escape key when an onClose handler is given.
// =============================================

function Modal({ title, children, footer, onClose, size }) {

    useEffect(() => {

        const handleKey = (event) => {

            if (event.key === "Escape" && onClose) {
                onClose();
            }

        };

        window.addEventListener("keydown", handleKey);

        return () =>
            window.removeEventListener("keydown", handleKey);

    }, [onClose]);


    return (

        <div
            className="modal-overlay"
            onMouseDown={onClose}
        >

            <div
                className={
                    `modal-card ${
                        size === "sm" ? "modal-card-sm" : ""
                    }`
                }
                role="dialog"
                aria-modal="true"
                onMouseDown={(event) => event.stopPropagation()}
            >

                <div className="modal-header">

                    <h3>{title}</h3>

                    {onClose && (
                        <button
                            type="button"
                            className="modal-close"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <XIcon size={18} />
                        </button>
                    )}

                </div>


                <div className="modal-body">
                    {children}
                </div>


                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}

            </div>

        </div>

    );
}

export default Modal;
