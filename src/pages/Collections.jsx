import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "../styles/global.css";

const ICONS = ["📁","🐛","⚡","🔥","🌊","🔮","🎯","💡"];

export default function Collections() {
  const { user, token, authAxios } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [name, setName]               = useState("");
  const [desc, setDesc]               = useState("");
  const [error, setError]             = useState("");

  useEffect(() => { if (!token) navigate("/login"); }, [token]);

  useEffect(() => {
    if (!token) return;
    authAxios({ method: "get", url: "http://localhost:5000/api/collections" })
      .then((res) => setCollections(res.data))
      .catch(() => setError("Failed to load collections"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault(); if (!name.trim()) return;
    try {
      const res = await authAxios({
        method:"post", url:"http://localhost:5000/api/collections",
        data:{ name:name.trim(), desc:desc.trim() },
      });
      setCollections((prev) => [res.data, ...prev]);
      setName(""); setDesc(""); setShowModal(false);
    } catch (err) { setError(err.response?.data?.error || "Failed to create"); }
  };

  const handleDelete = async (id) => {
    try {
      await authAxios({ method:"delete", url:`http://localhost:5000/api/collections/${id}` });
      setCollections((prev) => prev.filter((c) => c._id !== id));
    } catch { setError("Failed to delete"); }
  };

  return (
    <div className="collections-page">
      <Navbar />

      <div className="collections-header">
        <div style={{position:"relative"}}>
          <h1>My Collections</h1>
          <p style={{color:"rgba(255,255,255,0.45)",marginTop:"6px",fontSize:"14px"}}>
            {user ? `Signed in as ${user.name}` : "Organize your saved debugging sessions."}
          </p>
        </div>
        <button className="btn-primary" style={{position:"relative"}} onClick={() => setShowModal(true)}>
          + New collection
        </button>
      </div>

      <div className="collections-grid">
        {loading ? (
          <p style={{color:"rgba(255,255,255,0.35)",fontSize:"14px"}}>Loading…</p>
        ) : (
          <>
            {collections.map((col, idx) => (
              <div key={col._id} className="collection-card"
                style={{ position: "relative", cursor: "pointer" }}
                onClick={() => navigate(`/collections/${col._id}`)}
              >
                <div className="collection-icon">
                  <span style={{fontSize:"20px"}}>{ICONS[idx % ICONS.length]}</span>
                </div>
                <h3>{col.name}</h3>
                <p>{col.desc || "No description."}</p>
                <div className="collection-count"
                  style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span>{new Date(col.createdAt).toLocaleDateString()}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(col._id); }}
                    style={{background:"none",border:"none",color:"rgba(248,113,113,0.7)",
                      cursor:"pointer",fontSize:"12px",fontFamily:"Inter,sans-serif",
                      transition:"color .2s"}}
                    onMouseEnter={e=>e.target.style.color="#f87171"}
                    onMouseLeave={e=>e.target.style.color="rgba(248,113,113,0.7)"}>
                    Delete
                  </button>
                </div>
              </div>
            ))}

            <div className="collection-card"
              style={{border:"1px dashed rgba(255,255,255,0.15)",cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",minHeight:"160px",
                color:"rgba(255,255,255,0.3)",transition:"border-color .2s,color .2s"}}
              onClick={() => setShowModal(true)}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(167,139,250,0.5)";e.currentTarget.style.color="rgba(167,139,250,0.8)"}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";e.currentTarget.style.color="rgba(255,255,255,0.3)"}}>
              <div style={{fontSize:"28px",marginBottom:"8px"}}>+</div>
              <p style={{fontSize:"13px"}}>Create a collection</p>
            </div>
          </>
        )}
      </div>

      {error && <p style={{color:"#f87171",fontSize:"13px",padding:"0 48px"}}>{error}</p>}

      {showModal && (
        <div className="modal-overlay" onClick={(e)=>{ if(e.target===e.currentTarget) setShowModal(false); }}>
          <div className="modal-card">
            <h2>Create a collection</h2>
            <form className="modal-form" onSubmit={handleCreate}>
              <input type="text" placeholder="Collection name"
                value={name} onChange={(e)=>setName(e.target.value)} autoFocus required/>
              <textarea placeholder="Description (optional)"
                value={desc} onChange={(e)=>setDesc(e.target.value)}/>
              <div className="modal-actions">
                <button type="submit" className="btn-primary" style={{flex:1,justifyContent:"center"}}>Create</button>
                <button type="button" className="btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
