import Modal from './Modal';
import { CheckCircle, XCircle } from 'lucide-react';

interface MessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'success' | 'error';
}

export default function MessageModal({ isOpen, onClose, title, message, type = 'success' }: MessageModalProps) {
    const isSuccess = type === 'success';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="text-center">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                    {isSuccess ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 mb-6">{message}</p>
                <button
                    onClick={onClose}
                    className={`w-full py-2.5 rounded-lg text-white font-medium transition-colors ${isSuccess ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-red-600 hover:bg-red-700'
                        }`}
                >
                    {isSuccess ? 'Great!' : 'Close'}
                </button>
            </div>
        </Modal>
    );
}
