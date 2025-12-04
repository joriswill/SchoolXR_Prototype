import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiTrash } from "react-icons/hi";

function ManageCollections() {
	const navigate = useNavigate();
	const [collections, setCollections] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [deleting, setDeleting] = useState(null);

	const loadCollections = async () => {
		try {
			setLoading(true);
			const res = await fetch("/api/annotations/collections/all");
			const data = await res.json();
			setCollections(data || []);
		} catch (err) {
			console.error("Fehler beim Laden der Collections:", err);
			setError("Sammlungen konnten nicht geladen werden.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadCollections();
	}, []);

	const deleteCollection = async (name) => {
		if (
			!confirm(
				`Sammlung "${name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
			)
		)
			return;
		try {
			setDeleting(name);
			const res = await fetch(
				`/api/annotations/collection/${encodeURIComponent(name)}`,
				{ method: "DELETE" }
			);
			if (!res.ok) throw new Error("Delete failed");
			await loadCollections();
		} catch (err) {
			console.error("Fehler beim Löschen:", err);
			alert("Fehler beim Löschen der Sammlung.");
		} finally {
			setDeleting(null);
		}
	};

	return (
		<div
			className="flex flex-col items-center mt-16"
			style={{ minHeight: "100vh" }}
		>
			<h1 className="text-3xl mb-6">Sammlungen verwalten</h1>

			<div className="w-full max-w-xl px-4">
				<div className="bg-white rounded shadow p-4">
					<h2 className="font-semibold mb-4">Gespeicherte Sammlungen</h2>

					{loading && <div className="text-gray-500">Lade...</div>}
					{error && <div className="text-red-600 mb-4">{error}</div>}

					{!loading && collections.length === 0 && (
						<div className="text-sm text-gray-600">
							Keine Sammlungen gefunden.
						</div>
					)}

					<ul className="divide-y mt-2">
						{collections.map((c) => (
							<li
								key={c._id}
								className="py-3 flex items-center justify-between"
							>
								<div>
									<div className="font-medium">{c._id}</div>
									<div className="text-sm text-gray-600">
										(Einträge: {c.count || 0})
									</div>
								</div>
								<div className="flex items-center gap-2">
									<button
										className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
										onClick={() =>
											navigate("/final", { state: { collectionName: c._id } })
										}
									>
										Starten
									</button>
									<button
										className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
										onClick={() => deleteCollection(c._id)}
										disabled={deleting === c._id}
										title={`Sammlung ${c._id} löschen`}
									>
										<HiTrash />
									</button>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}

export default ManageCollections;
