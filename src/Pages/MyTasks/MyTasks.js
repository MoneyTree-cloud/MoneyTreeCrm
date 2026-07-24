/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Badge, ListGroup, ListGroupItem, InputGroup, InputGroupText, Spinner, UncontrolledTooltip, FormFeedback } from 'reactstrap';
import { FaPlus, FaEdit, FaCommentDots, FaBell, FaPaperPlane, FaTasks, FaSpinner, FaCheckCircle, FaTimesCircle, FaInbox, } from 'react-icons/fa';
import classnames from 'classnames';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { defaultTheme } from '../../helpers/defaultTheme';
import '../CSS/styles.css';
import ApiClient from '../../helpers/api_helper';
import { useGet } from '../../Hooks/useApi';
import { CREATE_TASK, GET_ALL_TASKS, GET_TASK_MEMBERS, UPDATE_TASK, TASK_REPLY_URL, SEND_TASK_REMINDER } from '../../helpers/url_helper';
import Select from 'react-select';
import { formatActionType, formatDate, RequiredStar } from '../../helpers/function_helper';
import { useUserStore } from '../../store/useUserStore';
import { toast } from 'react-toastify';

export default function MyTasks() {
    const { userId, userName } = useUserStore((state) => state.user);
    const [modal, setModal] = useState(false);
    const [chatModal, setChatModal] = useState(false);
    const [activeTab, setActiveTab] = useState('1');
    const [editMode, setEditMode] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState({});
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [chatError, setChatError] = useState('');

    const { data: membersList } = useGet(GET_TASK_MEMBERS);
    const memberOptions = membersList?.data?.data?.map(mem => ({
        value: mem.userId,
        label: `${mem.memberName} (${mem.empCode})`
    })) || [];

    const [taskData, setTaskData] = useState({
        employee: '',
        dueDate: '',
        description: '',
        status: 'ASSIGNED',
    });

    useEffect(() => {
        fetchTasksFromApi();
    }, [activeTab, userId]);

    const fetchTasksFromApi = () => {
        setLoadingTasks(true);
        const statusMap = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'];
        const status = statusMap[parseInt(activeTab, 10) - 1] || 'ASSIGNED';

        ApiClient.get(`${GET_ALL_TASKS}?userId=${userId}&status=${encodeURIComponent(status)}`)
            .then(resp => {
                setLoadingTasks(false);
                if (resp.data && resp.data.status === 1) {
                    setTasks(resp.data.data || []);
                } else if (resp.data.message !== 'No record found.') {
                    toast.error(resp.data.message || 'Error fetching tasks');
                    setTasks([]);
                }
            })
            .catch(err => {
                toast.error(err.message || 'API error fetching tasks');
                setLoadingTasks(false);
                setTasks([]);
            });
    };

    const toggleModal = () => {
        setModal(!modal);
        if (!modal) {
            setEditMode(false);
            setTaskData({
                employee: '',
                dueDate: '',
                description: '',
                status: 'ASSIGNED'
            });
            setFormErrors({});
        }
    };

    const toggleChatModal = (taskId = null, taskMessages = []) => {
        setSelectedTaskId(taskId);
        setChatModal(!chatModal);
        setChatError('');
        if (!chatModal && taskId) {
            fetchChatMessages(taskId, taskMessages);
        }
    };

    const fetchChatMessages = (taskId, taskMessages) => {
        setMessages(prev => ({ ...prev, [taskId]: [] })); // Clear previous messages
        setMessages(prev => ({ ...prev, [taskId]: taskMessages }));
    };

    const handleInputChange = (e) => {
        setTaskData({ ...taskData, [e.target.name]: e.target.value });
        setFormErrors({ ...formErrors, [e.target.name]: '' });
    };

    const handleEmployeeChange = (selectedOptions) => {
        setTaskData({
            ...taskData,
            employee: selectedOptions
                ? selectedOptions.map(option => option.value)
                : []
        });

        setFormErrors({
            ...formErrors,
            employee: ''
        });
    };

    const validateForm = () => {
        const errors = {};
        if (!taskData.employee) errors.employee = 'Employee is required';
        if (!taskData.dueDate) errors.dueDate = 'Due Date is required';
        if (!taskData.description || taskData.description.trim() === '') errors.description = 'Description is required';
        if (editMode && (!taskData.status || taskData.status.trim() === '')) errors.status = 'Status is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleTaskSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);

        const baseParams = {
            description: taskData.description.trim(),
            createdBy: userId,
            dueDate: taskData.dueDate,
        };

        try {
            const requests = taskData.employee.map(empId => {
                return ApiClient.post(CREATE_TASK, null, {
                    params: {
                        ...baseParams,
                        assignTo: empId
                    }
                });
            });

            await Promise.all(requests);

            fetchTasksFromApi();
            toggleModal();
            toast.success('Task created successfully');
        } catch (err) {
            toast.error(err.message || 'API error creating task');
        } finally {
            setSubmitting(false);
        }
    };

    const handleTaskUpdate = async () => {
        if (!validateForm()) return;
        setSubmitting(true);
        const baseParams = {
            description: taskData.description.trim(),
            dueDate: taskData.dueDate,
            taskId: selectedTaskId,
            status: taskData.status,
        };

        try {
            const requests = taskData.employee.map(empId =>
                ApiClient.post(UPDATE_TASK, null, {
                    params: {
                        ...baseParams,
                        assignTo: empId
                    }
                })
            );

            await Promise.all(requests);

            fetchTasksFromApi();
            toggleModal();
            toast.success('Task updated successfully');
        } catch (err) {
            toast.error(err.message || 'API error updating task');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditTask = (taskId) => {
        const task = tasks.find(t => t.id === taskId);

        if (task) {
            setTaskData({
                employee: task.assigneeUserId,
                // ? [task.assigneeUserId] 
                // : [],
                dueDate: task.dueDate?.split(' ')[0],
                description: task.description,
                status: task.status,
            });

            setEditMode(true);
            setSelectedTaskId(taskId);
            setFormErrors({});
            setModal(true);
        }
    };

    const handleChatMessageSend = () => {
        if (newMessage.trim() === '') {
            setChatError('Message cannot be empty');
            return;
        }
        setChatError('');
        const params = {
            taskId: selectedTaskId,
            reply: newMessage.trim(),
            userId: userId,
        };
        ApiClient.post(TASK_REPLY_URL, params)
            .then(resp => {
                if (resp.data && resp.data.status === 1) {
                    setMessages(prev => ({
                        ...prev,
                        [selectedTaskId]: [...(prev[selectedTaskId] || []), {
                            reply: newMessage.trim(),
                            repliedByName: userName,
                            repliedDate: new Date().toISOString(),
                        }],
                    }));
                    setNewMessage('');
                } else {
                    toast.error(resp.data?.message || 'Failed to send reply');
                }
            })
            .catch(err => {
                toast.error(err.message || 'API error sending reply');
            });
    };

    const handleSendReminder = (taskId) => {
        const params = {
            taskId,
        };
        ApiClient.get(SEND_TASK_REMINDER, { params })
            .then(resp => {
                if (resp.data && resp.data.status === 1) {
                    toast.success(resp.data.message || 'Reminder sent successfully');
                } else {
                    toast.error(resp.data.message || 'Error sending reminder');
                }
            })
            .catch(err => {
                toast.error(err.message || 'API error sending reminder');
            });
    };

    const filterTasksByStatus = (status) => tasks.filter(task => task.status === status);

    const renderTaskItem = (task) => (
        <ListGroupItem
            key={task.id}
            className="shadow-sm p-3 mb-3 rounded card-style"
        >
            <Row>
                <Col xs="12" md="11">
                    <div className="mb-2"><strong>Assigned by:</strong> {task.assignerName + ' (' + task.assignerCode + ')'}</div>
                    <div className="mb-1"><strong>Assigned To:</strong> {task.assigneeName + ' (' + task.assigneeCode + ')'}</div>
                    <div className="mb-1">
                        <strong>Status:</strong> <Badge color="info">{formatActionType(task.status)}</Badge>
                    </div>
                    <div className="mb-1"><strong>Assign Date:</strong> {formatDate(task.createdAt)}</div>
                    <div className="mb-1"><strong>Due Date:</strong> {formatDate(task.dueDate)}</div>
                    <div className="mb-1"><strong>Description:</strong> {task.description}</div>
                </Col>
                <Col xs="12" md="1" className="d-flex flex-row flex-md-column justify-content-end align-items-start mt-2 mt-md-0">
                    <Button
                        title="Edit Task"
                        color="info"
                        size="sm"
                        onClick={() => handleEditTask(task.id)}
                        className="mb-2 mr-2 mr-md-0"
                    >
                        <FaEdit />
                    </Button>
                    <Button
                        color="secondary"
                        size="sm"
                        onClick={() => toggleChatModal(task.id, task.taskReminderReplies)}
                        className="mb-2 mr-2 mr-md-0"
                        id={`chat-${task.id}`}
                    >
                        <FaCommentDots title="Chat" />
                        {task?.taskReminderReplies?.length > 0 && (
                            <Badge color="danger" pill className="ml-1">{task?.taskReminderReplies.length}</Badge>
                        )}
                    </Button>
                    <UncontrolledTooltip target={`chat-${task.id}`}>Chat</UncontrolledTooltip>
                    {String(task.assignerUserId) === userId && (
                        <Button
                            title="Send Reminder"
                            color="warning"
                            size="sm"
                            onClick={() => handleSendReminder(task.id)}
                        >
                            <FaBell />
                        </Button>
                    )}
                </Col>
            </Row>
        </ListGroupItem>
    );

    return (
        <PageContent>
            <Breadcrumbs title="My Tasks" breadcrumbItem="Task Management" />

            <div className="d-flex justify-content-end mb-3">
                <Button color="primary" onClick={toggleModal}>
                    <FaPlus /> Add Task
                </Button>
            </div>

            {/* Create / Update Modal */}
            <Modal isOpen={modal} toggle={toggleModal} centered>
                <ModalHeader toggle={toggleModal}>
                    {editMode ? 'Update Task' : 'Create New Task'}
                </ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Label for="employee">Employee <RequiredStar /></Label>
                            <Select
                                isMulti
                                value={memberOptions?.filter(opt =>
                                    Array.isArray(taskData.employee) &&
                                    taskData.employee.includes(opt.value)
                                )}
                                onChange={handleEmployeeChange}
                                options={memberOptions}
                                placeholder="Select Employee"
                                isClearable
                                closeMenuOnSelect={false}
                            />

                        </FormGroup>

                        <FormGroup>
                            <Label for="dueDate">Due Date <RequiredStar /></Label>
                            <Input
                                type="date"
                                name="dueDate"
                                value={taskData.dueDate}
                                onChange={handleInputChange}
                                invalid={!!formErrors.dueDate}
                            />
                            {formErrors.dueDate && <FormFeedback>{formErrors.dueDate}</FormFeedback>}
                        </FormGroup>

                        <FormGroup>
                            <Label for="description">Description <RequiredStar /></Label>
                            <Input
                                type="textarea"
                                name="description"
                                value={taskData.description}
                                onChange={handleInputChange}
                                placeholder="Enter task description..."
                                invalid={!!formErrors.description}
                            />
                            {formErrors.description && <FormFeedback>{formErrors.description}</FormFeedback>}
                        </FormGroup>

                        {editMode && (
                            <FormGroup>
                                <Label for="status">Status <RequiredStar /></Label>
                                <Select
                                    name="status"
                                    isClearable
                                    value={{
                                        label: taskData.status,
                                        value: taskData.status
                                    }}
                                    onChange={(selectedOption) => handleInputChange({
                                        target: { name: 'status', value: selectedOption.value }
                                    })}
                                    options={[
                                        { value: 'ASSIGNED', label: 'Assigned' },
                                        { value: 'IN_PROGRESS', label: 'In Progress' },
                                        { value: 'COMPLETED', label: 'Completed' },
                                        { value: 'REJECTED', label: 'Rejected' }
                                    ]}
                                    isInvalid={!!formErrors.status} // to show error state
                                    className={formErrors.status ? 'is-invalid' : ''}
                                />
                                {formErrors.status && <FormFeedback>{formErrors.status}</FormFeedback>}
                            </FormGroup>

                        )}
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color={editMode ? 'warning' : 'primary'}
                        onClick={editMode ? handleTaskUpdate : handleTaskSubmit}
                        disabled={submitting}
                        style={{ backgroundColor: defaultTheme.primary }}
                    >
                        {submitting && <Spinner size="sm" />} {editMode ? 'Update' : 'Create'}
                    </Button>
                    <Button color="secondary" onClick={toggleModal} style={{ backgroundColor: defaultTheme.goldColorLogo }}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Tabs */}
            <Nav tabs className="custom-tabs mb-4">
                {[
                    { label: 'Assigned', icon: <FaTasks className="tab-icon" /> },
                    { label: 'In Progress', icon: <FaSpinner className="tab-icon" /> },
                    { label: 'Completed', icon: <FaCheckCircle className="tab-icon" /> },
                    { label: 'Rejected', icon: <FaTimesCircle className="tab-icon" /> },
                ].map(({ label, icon }, index) => (
                    <NavItem key={label}>
                        <NavLink
                            className={classnames({ active: activeTab === `${index + 1}` })}
                            onClick={() => setActiveTab(`${index + 1}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            {icon} {label}
                        </NavLink>
                    </NavItem>
                ))}
            </Nav>

            <TabContent activeTab={activeTab} className="mt-3">
                {['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'].map((status, index) => {
                    const filtered = filterTasksByStatus(status);
                    return (
                        <TabPane tabId={`${index + 1}`} key={status}>
                            {loadingTasks ? (
                                <div className="text-center my-5">
                                    <Spinner />
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="no-data-card mx-auto text-center">
                                    <div className="icon-wrapper mx-auto mb-4">
                                        <FaInbox size={40} />
                                    </div>
                                    <h5 className="no-data-title text-muted mb-3">
                                        No tasks in <strong>{status.replace('_', ' ')}</strong>
                                    </h5>
                                    <p className="no-data-subtitle text-muted mb-4">
                                        You're all caught up! ✨
                                    </p>
                                </div>
                            ) : (
                                <ListGroup>
                                    {filtered.map(renderTaskItem)}
                                </ListGroup>
                            )}
                        </TabPane>
                    );
                })}
            </TabContent>

            {/* Chat Modal */}
            <Modal
                isOpen={chatModal}
                toggle={() => {
                    toggleChatModal(null);
                    fetchTasksFromApi();
                    setNewMessage('');
                }}
                centered
                size="md"
            >
                <ModalHeader toggle={() => {
                    toggleChatModal(null);
                    fetchTasksFromApi();
                    setNewMessage('');
                }}>
                    Chat - Task #{selectedTaskId}
                </ModalHeader>
                <ModalBody style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {messages[selectedTaskId]?.length > 0 ? (
                        messages[selectedTaskId].map((msg, idx) => (
                            <div key={idx} className="mb-2 p-2 rounded bg-light shadow-sm">
                                <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                    <strong>{msg.repliedByName}</strong> <span>({formatDate(msg.repliedDate)})</span>
                                </div>
                                <div className="mt-1">{msg.reply}</div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted">No messages yet.</p>
                    )}
                </ModalBody>
                <ModalFooter>
                    <InputGroup>
                        <Input
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={e => {
                                setNewMessage(e.target.value);
                                setChatError('');
                            }}
                            invalid={!!chatError}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleChatMessageSend();
                                }
                            }}
                        />
                        <InputGroupText style={{ cursor: 'pointer', backgroundColor: defaultTheme.primary }} onClick={handleChatMessageSend}>
                            <FaPaperPlane color='white' />
                        </InputGroupText>
                        {chatError && <FormFeedback className="d-block">{chatError}</FormFeedback>}
                    </InputGroup>
                </ModalFooter>
            </Modal>
        </PageContent>
    );
}
