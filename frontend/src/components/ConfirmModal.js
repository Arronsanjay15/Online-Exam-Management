import Modal from "./Modal";

import { AlertIcon } from "./Icons";

// =============================================
// CONFIRM POPUP
// A small shared popup that replaces window.confirm.
// Used before destructive actions such as deleting
// an exam, question, result or student.
// =============================================

function ConfirmModal({
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    danger = false,
    busy = false,
    onConfirm,
    onCancel
}) {

    return (

        <Modal
            title={title}
            size="sm"
            onClose={onCancel}
            footer={
                <>
                    <button
                        type="button"
                        className="modal-button secondary"
                        onClick={onCancel}
                        disabled={busy}
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        className={
                            `modal-button ${
                                danger ? "danger" : "primary"
                            }`
                        }
                        onClick={onConfirm}
                        disabled={busy}
                    >
                        {busy ? "Please wait..." : confirmLabel}
                    </button>
                </>
            }
        >

            <div className="modal-warning">

                <div className="modal-warning-icon">
                    <AlertIcon size={22} />
                </div>

                <div>
                    <p>{message}</p>
                </div>

            </div>

        </Modal>

    );

}

export default ConfirmModal;
