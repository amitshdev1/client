"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { FaArrowLeft, FaTrash } from "react-icons/fa"
import TaskList from "../components/tasks/TaskList"
import CreateTaskModal from "../components/tasks/CreateTaskModal"
import DeleteConfirmModal from "../components/common/DeleteConfirmModal"
import "./ProjectDetails.css"

const ProjectDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    fetchProjectAndTasks()
  }, [id])

  const fetchProjectAndTasks = async () => {
    try {
      const projectRes = await axios.get(`https://server-coral-iota-70.vercel.app/api/projects/${id}`)
      const tasksRes = await axios.get(`https://server-coral-iota-70.vercel.app/api/projects/${id}/tasks`)

      setProject(projectRes.data)
      setTasks(tasksRes.data)
      setLoading(false)
    } catch (error) {
      toast.error("Failed to fetch project details")
      setLoading(false)
      navigate("/dashboard")
    }
  }

  const handleCreateTask = async (taskData) => {
    try {
      const res = await axios.post(`https://server-coral-iota-70.vercel.app/api/projects/${id}/tasks`, taskData)
      setTasks([...tasks, res.data])
      setIsTaskModalOpen(false)
      toast.success("Task created successfully")
    } catch (error) {
      toast.error("Failed to create task")
    }
  }

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await axios.put(`https://server-coral-iota-70.vercel.app/api/tasks/${taskId}`, { status: newStatus })

      setTasks(tasks.map((task) => (task._id === taskId ? { ...task, status: newStatus } : task)))

      toast.success("Task status updated")
    } catch (error) {
      toast.error("Failed to update task status")
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`https://server-coral-iota-70.vercel.app/api/tasks/${taskId}`)
      setTasks(tasks.filter((task) => task._id !== taskId))
      toast.success("Task deleted successfully")
    } catch (error) {
      toast.error("Failed to delete task")
    }
  }

  const handleDeleteProject = async () => {
    try {
      await axios.delete(`https://server-coral-iota-70.vercel.app/api/projects/${id}`)
      toast.success("Project deleted successfully")
      navigate("/dashboard")
    } catch (error) {
      toast.error("Failed to delete project")
    }
  }

  if (loading) {
    return <div className="loading">Loading project details...</div>
  }

  return (
    <div className="project-details">
      <div className="project-header">
        <div className="back-button">
          <Link to="/dashboard">
            <FaArrowLeft /> Back to Projects
          </Link>
        </div>
        <div className="project-title">
          <h1>{project.title}</h1>
          <button className="btn btn-danger delete-btn" onClick={() => setIsDeleteModalOpen(true)}>
            <FaTrash /> Delete Project
          </button>
        </div>
        <p className="project-description">{project.description}</p>
        <button className="btn" onClick={() => setIsTaskModalOpen(true)}>
          Create Task
        </button>
      </div>

      <div className="task-board">
        <div className="task-column">
          <h2>To Do</h2>
          <TaskList
            tasks={tasks.filter((task) => task.status === "To Do")}
            onUpdateStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
          />
        </div>
        <div className="task-column">
          <h2>In Progress</h2>
          <TaskList
            tasks={tasks.filter((task) => task.status === "In Progress")}
            onUpdateStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
          />
        </div>
        <div className="task-column">
          <h2>Completed</h2>
          <TaskList
            tasks={tasks.filter((task) => task.status === "Completed")}
            onUpdateStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      </div>

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreateTask={handleCreateTask}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone and all tasks will be permanently deleted."
      />
    </div>
  )
}

export default ProjectDetails
