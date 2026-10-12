import Modal from "./Modal";

import { CheckIcon, AlertIcon } from "./Icons";

// =============================================
// NOTICE POPUP
// A small shared popup that replaces window.alert
// for success / error / info messages. Pass a
// `notice` object shaped like:
//   { type: "success" | "error" | "info",
//     title: "...", message: "..." }
// =============================================

function NoticeModal({ notice, onClose }) {

    if (!notice) {
        return null;
    }

    const isSuccess = notice.type === "success";

    return (

        <Modal
            title={notice.title}
            size="sm"
            onClose={onClose}
            footer={
                <button
                    type="button"
                    className="modal-button primary"
                    onClick={onClose}
                >
                    Close
                </button>
            }
        >

            <div className={`modal-result ${notice.type}`}>

                <div className="modal-result-icon">

                    {isSuccess
                        ? <CheckIcon size={26} />
                        : <AlertIcon size={26} />}

                </div>

                <p>{notice.message}</p>

            </div>

        </Modal>

    );

}

export default NoticeModal;
