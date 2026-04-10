import React, { useState } from "react";
import { uploadFile } from "../services/api";

function UploadBox() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please choose a file first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadFile(formData);
      setMessage(`✅ ${response.data.status} (${response.data.records_inserted} records)`);
      setFile(null);
    } catch (error) {
      setMessage(`❌ Upload failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-box">
      <h2 className="section-title">📂 Upload CSV</h2>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
        className="file-input"
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="btn btn-upload"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {message && <p className="upload-message">{message}</p>}
    </div>
  );
}

export default UploadBox;
