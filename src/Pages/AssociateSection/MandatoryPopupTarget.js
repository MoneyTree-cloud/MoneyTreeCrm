import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Input, FormGroup, Label, Alert } from 'reactstrap';
import { UPDATE_SALES_TARGET_POPUP_SALES } from '../../helpers/url_helper';
import { toast } from 'react-toastify';
import ApiClient from '../../helpers/api_helper';
import { formatDate } from '../../helpers/function_helper';

const MandatoryPopupTarget = ({ data, onSaveSuccess }) => {
    const [items, setItems] = useState([]);
    const [inputValues, setInputValues] = useState({});
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        setItems(data || []);
    }, [data]);

    const validateInput = (value, targetType, targetId) => {
        if (targetType === 'Turnover') {
            // Allow: 1, 1.2, 0.1, 0.002, etc.; Disallow: 00, 0, 0.0, 00.1
            const regex = /^(0\.[0-9]{1,3}|[1-9][0-9]*\.?[0-9]{0,3})$/;
            if (!regex.test(value) || value.length > 5 || value === '0' || value === '0.0' || value === '0.00' || value === '0.000') {
                setErrors(prev => ({ ...prev, [targetId]: 'Enter a valid number (e.g., 1.454, 0.1, max 4 digits, no leading zeros)' }));
                return false;
            }
        } else if (targetType === 'Unit') {
            // Allow: 0, 01, 12, 99; Disallow: non-digits, >99
            const regex = /^\d{1,2}$/;
            if (!regex.test(value) || parseInt(value) > 99) {
                setErrors(prev => ({ ...prev, [targetId]: 'Enter a whole number (max 2 digits, e.g., 01, 12)' }));
                return false;
            }
        }
        setErrors(prev => ({ ...prev, [targetId]: '' }));
        return true;
    };

    const handleInputChange = (e, targetId, targetType) => {
        const { value } = e.target;
        if (targetType === 'Turnover') {
            if (!/^\d*\.?\d{0,3}$/.test(value) || value.length > 5) return;
        } else if (targetType === 'Unit') {
            if (!/^\d{0,2}$/.test(value)) return;
        }
        setInputValues(prev => ({ ...prev, [targetId]: value }));
        validateInput(value, targetType, targetId);
    };

    const handleKeyPress = (e, targetType) => {
        const char = String.fromCharCode(e.charCode || e.which);
        if (targetType === 'Turnover') {
            if (!/[0-9.]/.test(char)) {
                e.preventDefault();
            }
            if (char === '.' && e.target.value.includes('.')) {
                e.preventDefault();
            }
        } else if (targetType === 'Unit') {
            if (!/[0-9]/.test(char)) {
                e.preventDefault();
            }
        }
    };

    const handleSave = (targetId) => {
        const value = inputValues[targetId] || '';
        const item = items.find(item => item.targetId === targetId);
        if (!item) return;

        if (validateInput(value, item.targetType, targetId)) {
            ApiClient.post(
                `${UPDATE_SALES_TARGET_POPUP_SALES}?targetId=${targetId}&targetType=${item.targetType}&target=${value}`
            )
                .then(function (response) {
                    if (response?.data?.status === 1) {
                        toast.success(response.data.message);
                        // //           // Update local state
                        setItems(prev => prev.filter(item => item.targetId !== targetId));
                        setInputValues(prev => {
                            const newValues = { ...prev };
                            delete newValues[targetId];
                            return newValues;
                        });
                        setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors[targetId];
                            return newErrors;
                        });
                        setApiError('');
                        // Call parent component's onSaveSuccess
                        if (onSaveSuccess) {
                            onSaveSuccess();
                        }
                    } else {
                        setApiError(response.data.message || 'Failed to save data.');
                        toast.error(response.data.message || 'Failed to save data.');
                    }
                })
                .catch(function (err) {
                    setApiError(err.message || 'Failed to save data. Please try again.');
                    toast.error(err.message || 'Failed to save data.');
                });
        }
    };

    const isModalOpen = items.length > 0;

    return (
        <Modal isOpen={isModalOpen} backdrop="static" keyboard={false}>
            <ModalHeader>Target</ModalHeader>
            <ModalBody>
                {apiError && <Alert color="danger">{apiError}</Alert>}
                {items.length === 0 ? (
                    <Alert color="success">All inputs have been saved!</Alert>
                ) : (
                    items.map(item => (
                        <FormGroup key={item.targetId}>
                            <Label>
                                {item.projectName} ({item.builderName}) - {item.targetType}
                            </Label>
                            <div className="d-flex">
                                <Input
                                    type="text"
                                    value={inputValues[item.targetId] || ''}
                                    onChange={(e) => handleInputChange(e, item.targetId, item.targetType)}
                                    onKeyPress={(e) => handleKeyPress(e, item.targetType)}
                                    placeholder={item.targetType === 'Turnover' ? 'e.g., 1.454' : 'e.g., 12'}
                                    invalid={!!errors[item.targetId]}
                                />
                                <Button
                                    color="primary"
                                    className="ms-2"
                                    onClick={() => handleSave(item.targetId)}
                                    disabled={!inputValues[item.targetId] || !!errors[item.targetId]}
                                >
                                    Save
                                </Button>
                            </div>
                            {errors[item.targetId] && (
                                <div className="text-danger mt-1">{errors[item.targetId]}</div>
                            )}
                            <div className="mt-1">
                                <small>From: {formatDate(item.fromDate)} To: {formatDate(item.toDate)}</small>
                                <br />
                            </div>
                        </FormGroup>
                    ))
                )}
            </ModalBody>
        </Modal>
    );
};

export default MandatoryPopupTarget;