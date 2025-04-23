"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import ProjectCard from "../components/projects/ProjectCard"
import CreateProjectModal from "../components/projects/CreateProjectModal"
import "./Dashboard.css"

const Dashboard = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`https://server-coral-iota-70.vercel.app/api/projects`)
      setProjects(res.data)
      setLoading(false)
    } catch (error) {
      toast.error("Failed to fetch projects")
      setLoading(false)
    }
  }

  const handleCreateProject = async (projectData) => {
    try {
      const res = await axios.post(`https://server-coral-iota-70.vercel.app/api/projects`, projectData)
      setProjects([...projects, res.data])
      setIsModalOpen(false)
      toast.success("Project created successfully")
    } catch (error) {
      toast.error("Failed to create project")
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Projects</h1>
        <button className="btn" onClick={() => setIsModalOpen(true)} disabled={projects.length >= 4}>
          Create Project
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="no-projects">
          <p>You don't have any projects yet.</p>
          <button className="btn" onClick={() => setIsModalOpen(true)}>
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
          {projects.length < 4 && (
            <div className="add-project-card" onClick={() => setIsModalOpen(true)}>
              <div className="add-icon">+</div>
              <p>Add New Project</p>
            </div>
          )}
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  )
}

export default Dashboard
