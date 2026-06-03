// Admin Dashboard Controller Logic
let chartInstances = {};
let activeTab = 'tab-stats';

document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});

function switchTab(tabId) {
    // Toggle active tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const clickedBtn = document.querySelector(`.tab-btn[onclick="switchTab('${tabId}')"]`);
    if (clickedBtn) clickedBtn.classList.add('active');

    // Toggle active contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    
    activeTab = tabId;
    
    // Refresh tab-specific data
    if (tabId === 'tab-stats') {
        loadAnalytics();
    } else if (tabId === 'tab-responses') {
        loadResponsesTable();
    } else if (tabId === 'tab-database') {
        loadBackupsList();
    }
}

function getActiveFilters() {
    return {
        gender: document.getElementById('filter-gender').value,
        age_group: document.getElementById('filter-age').value,
        education_level: document.getElementById('filter-education').value,
        neighborhood: document.getElementById('filter-neighborhood').value.trim()
    };
}

function resetFilters() {
    document.getElementById('filter-gender').value = '';
    document.getElementById('filter-age').value = '';
    document.getElementById('filter-education').value = '';
    document.getElementById('filter-neighborhood').value = '';
    loadAnalytics();
    if (activeTab === 'tab-responses') {
        loadResponsesTable();
    }
}

function buildQueryString(filters) {
    return Object.keys(filters)
        .filter(key => filters[key])
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`)
        .join('&');
}

function showToast(message, type = "success") {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast-notif ${type}`;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 4000);
}

// Destroy previous chart instances to avoid redraw conflicts
function destroyChart(id) {
    if (chartInstances[id]) {
        chartInstances[id].destroy();
        delete chartInstances[id];
    }
}

function loadDashboard() {
    loadAnalytics();
}

function loadAnalytics() {
    const filters = getActiveFilters();
    const qStr = buildQueryString(filters);
    
    fetch(`/admin/api/stats?${qStr}`)
        .then(res => res.json())
        .then(data => {
            // Update Dashboard Metrics Cards
            if (data.count !== undefined) {
                document.getElementById('metric-total').textContent = data.count;
            }
            
            // Render basic charts if responses exist
            if (data.count > 0) {
                renderSingleChoiceChart('chart-gender', 'doughnut', data.q1.chart_data, 'Sexe');
                renderSingleChoiceChart('chart-age', 'bar', data.q2.chart_data, 'Tranches d\'âge');
                renderSingleChoiceChart('chart-visited', 'doughnut', data.q7.chart_data, 'Fréquentation');
                
                renderMultiChoiceChart('chart-periods', data.q8.chart_data, 'Périodes');
                renderSingleChoiceChart('chart-frequency', 'bar', data.q9.chart_data, 'Fréquence');
                renderMultiChoiceChart('chart-movies', data.q11.chart_data, 'Genres de films');
                
                renderLikertStackedChart('chart-closing-reasons', data.q15, 'Causes de fermeture');
                renderLikertStackedChart('chart-representations', data.q17, 'Représentations');
                renderLikertStackedChart('chart-patrimony', data.q19, 'Valorisation & Avenir');
                
                renderMultiChoiceChart('chart-desired-usage', data.q20.chart_data, 'Usages');
                renderMultiChoiceChart('chart-support-type', data.q21.chart_data, 'Moyens de soutien');
                
                // Load Word Cloud
                loadSemanticAnalysis();
            } else {
                showToast("Aucune réponse ne correspond aux filtres actifs.", "error");
                // Clear charts
                Object.keys(chartInstances).forEach(id => destroyChart(id));
            }
        })
        .catch(err => {
            console.error("Error loading statistics:", err);
            showToast("Erreur lors de la récupération des statistiques.", "error");
        });
}

// Chart.js helper functions
const colorPalette = [
    '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe',
    '#1e3a8a', '#1d4ed8', '#1e40af', '#3b82f6', '#60a5fa'
];

function renderSingleChoiceChart(canvasId, type, chartData, label) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    chartInstances[canvasId] = new Chart(ctx, {
        type: type,
        data: {
            labels: chartData.labels,
            datasets: [{
                label: label,
                data: chartData.values,
                backgroundColor: colorPalette.slice(0, chartData.labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: (type === 'doughnut' || type === 'pie'),
                    position: 'bottom'
                }
            }
        }
    });
}

function renderMultiChoiceChart(canvasId, chartData, label) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Pourcentage de répondants (%)',
                data: chartData.percentages,
                backgroundColor: '#3b82f6',
                borderRadius: 4,
                borderWidth: 0
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { callback: value => value + '%' }
                }
            }
        }
    });
}

function renderLikertStackedChart(canvasId, likertStats, title) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const items = likertStats.items || {};
    const labels = [];
    
    // Five choices order matching Python stats output
    const scaleLabels = ["Pas du tout", "Plutôt non", "Neutre", "Plutôt oui", "Tout à fait"];
    const datasetValues = scaleLabels.map(() => []);
    
    Object.keys(items).forEach(col => {
        const item = items[col];
        // Truncate long statements for vertical axis labels
        let dispLabel = item.statement;
        if (dispLabel.length > 55) {
            dispLabel = dispLabel.substring(0, 52) + '...';
        }
        labels.push(dispLabel);
        
        scaleLabels.forEach((scale, index) => {
            const count = item.chart_data[index] || 0;
            // Calculate percentage
            const pct = item.total > 0 ? Math.round((count / item.total) * 100) : 0;
            datasetValues[index].push(pct);
        });
    });
    
    // Likert colors (Diverging Red to Green scheme)
    const likertColors = [
        '#f87171', // Pas du tout (Light red)
        '#fca5a5', // Plutôt non (Lighter red)
        '#cbd5e1', // Neutre (Grey)
        '#86efac', // Plutôt oui (Light green)
        '#4ade80'  // Tout à fait (Green)
    ];
    
    const datasets = scaleLabels.map((scale, index) => {
        return {
            label: scale,
            data: datasetValues[index],
            backgroundColor: likertColors[index]
        };
    });
    
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    max: 100,
                    ticks: { callback: value => value + '%' }
                },
                y: {
                    stacked: true
                }
            },
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Open responses semantic analysis
function loadSemanticAnalysis() {
    const filters = getActiveFilters();
    const qStr = buildQueryString(filters);
    const question = document.getElementById('semantic-question').value;
    
    fetch(`/admin/api/stats?${qStr}`)
        .then(res => res.json())
        .then(data => {
            let fieldData = {};
            if (question === 'q12') fieldData = data.q12;
            else if (question === 'q13_text') fieldData = data.q13_text;
            else if (question === 'q16') fieldData = data.q16;
            else if (question === 'q18') fieldData = data.q18;
            else if (question === 'q26') fieldData = data.q26;
            
            renderWordCloud(fieldData.word_frequencies || []);
            renderWordFreqTable(fieldData.word_frequencies || []);
        })
        .catch(err => {
            console.error("Error loading semantic analysis:", err);
        });
}

function renderWordCloud(frequencies) {
    const cloudContainer = document.getElementById('wordcloud');
    cloudContainer.innerHTML = '';
    
    if (frequencies.length === 0) {
        cloudContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 0.9rem;">Aucun mot-clé récurrent identifié pour le moment.</span>';
        return;
    }
    
    const maxVal = Math.max(...frequencies.map(f => f.value));
    
    frequencies.forEach(item => {
        const span = document.createElement('span');
        span.className = 'cloud-word';
        span.textContent = item.text;
        
        // Font size scaling between 12px and 34px
        const fontSize = 12 + ((item.value / maxVal) * 22);
        span.style.fontSize = `${fontSize}px`;
        
        // Dynamic colors using HSL theme values (blue variations)
        const lightness = 60 - ((item.value / maxVal) * 30); // Higher frequencies are darker blue
        span.style.color = `hsl(220, 85%, ${lightness}%)`;
        span.style.fontWeight = item.value > maxVal * 0.5 ? '700' : '500';
        
        // Tooltip
        span.title = `Fréquence: ${item.value}`;
        
        // Search trigger on click
        span.addEventListener('click', () => {
            switchTab('tab-responses');
            document.getElementById('search-keyword').value = item.text;
            loadResponsesTable();
        });
        
        cloudContainer.appendChild(span);
    });
}

function renderWordFreqTable(frequencies) {
    const tbody = document.querySelector('#word-freq-table tbody');
    tbody.innerHTML = '';
    
    if (frequencies.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align: center; color: var(--text-muted);">Aucune donnée</td></tr>';
        return;
    }
    
    frequencies.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.text}</strong></td>
            <td style="text-align: center; font-weight: 600; color: var(--primary);">${item.value}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Responses registry tab
function loadResponsesTable() {
    const filters = getActiveFilters();
    const search = document.getElementById('search-keyword').value.trim();
    
    let queryParams = buildQueryString(filters);
    if (search) {
        queryParams += (queryParams ? '&' : '') + `search=${encodeURIComponent(search)}`;
    }
    
    fetch(`/admin/api/responses?${queryParams}`)
        .then(res => res.json())
        .then(rows => {
            const tbody = document.querySelector('#responses-table tbody');
            tbody.innerHTML = '';
            
            if (rows.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-muted);">Aucun répondant ne correspond à la recherche.</td></tr>';
                return;
            }
            
            rows.forEach(r => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>#${r.id}</strong></td>
                    <td>${r.submission_date}</td>
                    <td>${r.q1_gender || '-'}</td>
                    <td>${r.q2_age_group || '-'}</td>
                    <td>${r.q3_neighborhood || '-'}</td>
                    <td>${r.q5_education_level || '-'}</td>
                    <td>${r.q7_visited_cinema || '-'}</td>
                    <td style="text-align: center;">
                        <button class="btn btn-secondary btn-xs" onclick="viewResponseDetails(${r.id})">Détails</button>
                        <button class="btn btn-danger btn-xs" onclick="confirmDeleteResponse(${r.id})">Supprimer</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error("Error loading responses:", err);
            showToast("Erreur lors de la récupération du registre.", "error");
        });
}

function viewResponseDetails(id) {
    fetch(`/admin/api/responses/${id}`)
        .then(res => res.json())
        .then(r => {
            document.getElementById('detail-modal-title').textContent = `Fiche Participant — Questionnaire N° ${r.id}`;
            const body = document.getElementById('detail-modal-body');
            
            // Format arrays
            const formatArr = (arr) => arr && arr.length > 0 ? arr.join(', ') : 'Aucun';
            
            // Build modal HTML
            let html = `
                <div class="detail-section">
                    <div class="detail-section-title">Informations de soumission</div>
                    <div class="detail-grid">
                        <div class="detail-item"><strong>Date d'enregistrement :</strong> <span>${r.submission_date}</span></div>
                        <div class="detail-item"><strong>Numéro de questionnaire :</strong> <span>#${r.id}</span></div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <div class="detail-section-title">Section A — Profil du répondant</div>
                    <div class="detail-grid">
                        <div class="detail-item"><strong>Q1. Sexe :</strong> <span>${r.q1_gender || '-'}</span></div>
                        <div class="detail-item"><strong>Q2. Tranche d'âge :</strong> <span>${r.q2_age_group || '-'}</span></div>
                        <div class="detail-item"><strong>Q3. Quartier de résidence :</strong> <span>${r.q3_neighborhood || '-'}</span></div>
                        <div class="detail-item"><strong>Q4. Durée de résidence :</strong> <span>${r.q4_residence_duration || '-'}</span></div>
                        <div class="detail-item"><strong>Q5. Niveau d'études :</strong> <span>${r.q5_education_level || '-'}</span></div>
                        <div class="detail-item"><strong>Q6. Situation pro :</strong> <span>${r.q6_profession || '-'}</span></div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <div class="detail-section-title">Section B — Mémoire et fréquentation des salles</div>
                    <div class="detail-grid" style="grid-template-columns: 1fr;">
                        <div class="detail-item"><strong>Q7. A fréquenté des salles à Safi :</strong> <span style="font-weight:700; color:var(--primary);">${r.q7_visited_cinema || '-'}</span></div>
                    </div>
            `;
            
            if (r.q7_visited_cinema === 'Oui') {
                html += `
                    <div class="detail-grid" style="margin-top: 0.5rem;">
                        <div class="detail-item"><strong>Q8. Périodes fréquentées :</strong> <span>${formatArr(r.q8_periods)}</span></div>
                        <div class="detail-item"><strong>Q9. Fréquence :</strong> <span>${r.q9_frequency || '-'}</span></div>
                        <div class="detail-item"><strong>Q10. Accompagnateurs habituels :</strong> <span>${formatArr(r.q10_companions)}</span></div>
                        <div class="detail-item"><strong>Q11. Types de films vus :</strong> <span>${formatArr(r.q11_movie_types)} ${r.q11_other ? '('+r.q11_other+')' : ''}</span></div>
                    </div>
                    <div class="detail-item" style="margin-top:0.5rem;">
                        <strong>Q12. Souvenir marquant :</strong>
                        <p style="background:var(--bg); padding:0.75rem; border-radius:6px; font-style:italic; margin-top:0.25rem; font-size:0.85rem;">"${r.q12_memory || 'Aucun souvenir saisi.'}"</p>
                    </div>
                `;
            }
            
            html += `
                </div>
                
                <div class="detail-section">
                    <div class="detail-section-title">Section C — Connaissance et identification</div>
            `;
            
            if (r.q7_visited_cinema === 'Oui') {
                html += `
                    <div class="detail-item" style="margin-bottom:0.75rem;">
                        <strong>Q13. Noms des salles citées (texte libre) :</strong> <span>${r.q13_text || '-'}</span>
                    </div>
                    
                    <div style="margin-bottom:0.75rem;">
                        <strong>Tableau des salles reconnues :</strong>
                `;
                
                if (r.q13_table && r.q13_table.length > 0) {
                    html += `
                        <table class="data-table" style="margin-top:0.25rem; font-size:0.8rem;">
                            <thead>
                                <tr><th>Nom de la salle</th><th>Localisation</th><th>État actuel</th></tr>
                            </thead>
                            <tbody>
                                ${r.q13_table.map(c => `<tr><td><strong>${c.name || '-'}</strong></td><td>${c.location || '-'}</td><td>${c.current_state || '-'}</td></tr>`).join('')}
                            </tbody>
                        </table>
                    `;
                } else {
                    html += `<p style="font-size:0.8rem; font-style:italic; color:var(--text-muted);">Aucune salle saisie dans le tableau.</p>`;
                }
                html += `</div>`;
            }
            
            html += `
                    <div class="detail-item"><strong>Q14. Devenir de ces anciennes salles :</strong> <span>${formatArr(r.q14_what_became)}</span></div>
                </div>
                
                <div class="detail-section">
                    <div class="detail-section-title">Section D — Causes de fermeture</div>
                    <div class="detail-grid">
                        <div class="detail-item"><strong>TV & satellites :</strong> <span>${r.q15_1 || '-'}</span></div>
                        <div class="detail-item"><strong>Streaming / Internet :</strong> <span>${r.q15_2 || '-'}</span></div>
                        <div class="detail-item"><strong>Piratage films :</strong> <span>${r.q15_3 || '-'}</span></div>
                        <div class="detail-item"><strong>Prix billets :</strong> <span>${r.q15_4 || '-'}</span></div>
                        <div class="detail-item"><strong>Vétusté des salles :</strong> <span>${r.q15_5 || '-'}</span></div>
                        <div class="detail-item"><strong>Qualité des films :</strong> <span>${r.q15_6 || '-'}</span></div>
                        <div class="detail-item"><strong>Sentiment insécurité :</strong> <span>${r.q15_7 || '-'}</span></div>
                        <div class="detail-item"><strong>Hausse prix terrains :</strong> <span>${r.q15_8 || '-'}</span></div>
                        <div class="detail-item"><strong>Manque soutien public :</strong> <span>${r.q15_9 || '-'}</span></div>
                        <div class="detail-item"><strong>Habitudes loisirs :</strong> <span>${r.q15_10 || '-'}</span></div>
                    </div>
                    <div class="detail-item" style="margin-top:0.5rem;">
                        <strong>Q16. Cause la PLUS importante :</strong> <span>${r.q16_main_cause || '-'}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Section E — Représentations et attachement</div>
                    <div class="detail-grid">
                        <div class="detail-item"><strong>Bons souvenirs :</strong> <span>${r.q17_1 || '-'}</span></div>
                        <div class="detail-item"><strong>Perte pour Safi :</strong> <span>${r.q17_2 || '-'}</span></div>
                        <div class="detail-item"><strong>État dégradant :</strong> <span>${r.q17_3 || '-'}</span></div>
                        <div class="detail-item"><strong>Attaché(e) aux lieux :</strong> <span>${r.q17_4 || '-'}</span></div>
                        <div class="detail-item"><strong>Identité de Safi :</strong> <span>${r.q17_5 || '-'}</span></div>
                        <div class="detail-item"><strong>Jeunes ignorent histoire :</strong> <span>${r.q17_6 || '-'}</span></div>
                    </div>
                    <div class="detail-item" style="margin-top:0.5rem;">
                        <strong>Q18. Ce qu'elles représentent en un mot :</strong> <span style="font-weight:700; color:var(--primary);">${r.q18_meaning || '-'}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Section F — Patrimoine et avenir</div>
                    <div class="detail-grid">
                        <div class="detail-item"><strong>Fait partie du patrimoine :</strong> <span>${r.q19_1 || '-'}</span></div>
                        <div class="detail-item"><strong>Faut réhabiliter :</strong> <span>${r.q19_2 || '-'}</span></div>
                        <div class="detail-item"><strong>Dynamiser centre-ville :</strong> <span>${r.q19_3 || '-'}</span></div>
                        <div class="detail-item"><strong>Création emplois :</strong> <span>${r.q19_4 || '-'}</span></div>
                        <div class="detail-item"><strong>Fréquenterait lieu culturel :</strong> <span>${r.q19_5 || '-'}</span></div>
                        <div class="detail-item"><strong>Associer les habitants :</strong> <span>${r.q19_6 || '-'}</span></div>
                    </div>
                    <div class="detail-grid" style="margin-top:0.5rem;">
                        <div class="detail-item"><strong>Q20. Usages souhaités :</strong> <span>${formatArr(r.q20_desired_usage)} ${r.q20_other ? '('+r.q20_other+')' : ''}</span></div>
                        <div class="detail-item"><strong>Q21. Disposé à soutenir :</strong> <span>${formatArr(r.q21_support_type)}</span></div>
                    </div>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Section G — Information et médias</div>
                    <div class="detail-grid">
                        <div class="detail-item"><strong>Q22. Déjà vu contenu média :</strong> <span>${r.q22_seen_content || '-'}</span></div>
                        <div class="detail-item"><strong>Q23. Canaux de diffusion :</strong> <span>${formatArr(r.q23_channels)}</span></div>
                        <div class="detail-item"><strong>Q24. Suit pages patrimoine :</strong> <span>${r.q24_follow_pages || '-'}</span></div>
                        <div class="detail-item"><strong>Q25_1. Trop peu de débats :</strong> <span>${r.q25_1 || '-'}</span></div>
                        <div class="detail-item"><strong>Q25_2. Utilité réseaux :</strong> <span>${r.q25_2 || '-'}</span></div>
                        <div class="detail-item"><strong>Q25_3. En savoir plus :</strong> <span>${r.q25_3 || '-'}</span></div>
                    </div>
                </div>

                <div class="detail-section">
                    <div class="detail-section-title">Section H — Suggestions et recontact</div>
                    <div class="detail-item">
                        <strong>Q26. Commentaire / suggestion :</strong>
                        <p style="background:var(--bg); padding:0.75rem; border-radius:6px; margin-top:0.25rem; font-size:0.85rem;">"${r.q26_comments || 'Aucun commentaire.'}"</p>
                    </div>
                    <div class="detail-grid" style="margin-top:0.5rem;">
                        <div class="detail-item"><strong>Q27. Prêt à un entretien :</strong> <span>${r.q27_recontact || '-'}</span></div>
                        <div class="detail-item"><strong>Moyen de contact laissé :</strong> <span>${r.q27_contact_details || 'Aucun'}</span></div>
                    </div>
                </div>
            `;
            
            body.innerHTML = html;
            document.getElementById('detailModal').style.display = 'flex';
        })
        .catch(err => {
            console.error("Error loading response details:", err);
            showToast("Impossible d'ouvrir les détails.", "error");
        });
}

function closeDetailModal() {
    document.getElementById('detailModal').style.display = 'none';
}

function confirmDeleteResponse(id) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement le questionnaire N° #${id} ? Cette action est irréversible.`)) {
        fetch(`/admin/api/responses/${id}/delete`, {
            method: 'POST'
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                showToast(data.message);
                loadResponsesTable();
            } else {
                showToast(data.message, "error");
            }
        })
        .catch(err => {
            console.error("Error deleting response:", err);
            showToast("Erreur lors de la suppression.", "error");
        });
    }
}

// Exports CSV / Excel
function exportData(type) {
    const filters = getActiveFilters();
    const qStr = buildQueryString(filters);
    window.location.href = `/admin/api/export/${type}?${qStr}`;
}

// Exports PDF (POST charts to server)
function generatePdfReport() {
    showToast("Génération du rapport PDF en cours...", "success");
    
    // Check if charts are drawn
    const chartGender = document.getElementById('chart-gender');
    const chartVisited = document.getElementById('chart-visited');
    const chartClosing = document.getElementById('chart-closing-reasons');
    const chartRep = document.getElementById('chart-representations');
    const chartPat = document.getElementById('chart-patrimony');
    
    const chartsData = {};
    if (chartGender) chartsData['chart_profil'] = chartGender.toDataURL('image/png');
    if (chartVisited) chartsData['chart_visited'] = chartVisited.toDataURL('image/png');
    if (chartClosing) chartsData['chart_closing'] = chartClosing.toDataURL('image/png');
    if (chartRep) chartsData['chart_representations'] = chartRep.toDataURL('image/png');
    if (chartPat) chartsData['chart_patrimony'] = chartPat.toDataURL('image/png');
    
    const payload = {
        filters: getActiveFilters(),
        charts: chartsData
    };
    
    fetch('/admin/api/export/pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (!res.ok) {
            throw new Error("HTTP error " + res.status);
        }
        return res.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport_statistiques_cinema_safi_${new Date().toISOString().slice(0,10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        showToast("Rapport PDF exporté avec succès.");
    })
    .catch(err => {
        console.error("Error generating PDF report:", err);
        showToast("Erreur lors de l'export PDF. Assurez-vous d'avoir des réponses enregistrées.", "error");
    });
}

// Database Management tab
function loadBackupsList() {
    fetch('/admin/api/backup/list')
        .then(res => res.json())
        .then(files => {
            const container = document.getElementById('backups-list');
            container.innerHTML = '';
            
            if (files.length === 0) {
                container.innerHTML = '<div style="padding:1rem; text-align:center; color:var(--text-muted); font-size:0.8rem;">Aucune sauvegarde enregistrée.</div>';
                return;
            }
            
            files.forEach(f => {
                const item = document.createElement('div');
                item.className = 'backup-item';
                item.innerHTML = `
                    <span><strong>${f}</strong></span>
                    <div style="display:flex; gap:0.25rem;">
                        <button class="btn btn-secondary btn-xs" onclick="restoreDbBackup('${f}')">Restaurer</button>
                    </div>
                `;
                container.appendChild(item);
            });
        })
        .catch(err => {
            console.error("Error loading backups list:", err);
        });
}

function triggerManualBackup() {
    fetch('/admin/api/backup', {
        method: 'POST'
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            showToast(data.message);
            loadBackupsList();
        } else {
            showToast(data.message, "error");
        }
    })
    .catch(err => {
        console.error("Error triggering backup:", err);
        showToast("Impossible de sauvegarder la base de données.", "error");
    });
}

function restoreDbBackup(filename) {
    if (confirm(`Voulez-vous vraiment restaurer la base de données à partir de la sauvegarde : ${filename} ? Toutes les modifications ultérieures seront écrasées.`)) {
        fetch('/admin/api/backup/restore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filename })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                showToast(data.message);
                loadAnalytics();
            } else {
                showToast(data.message, "error");
            }
        })
        .catch(err => {
            console.error("Error restoring database:", err);
            showToast("Impossible de restaurer la base de données.", "error");
        });
    }
}

function handleBackupUpload(e) {
    e.preventDefault();
    const form = document.getElementById('uploadBackupForm');
    const formData = new FormData(form);
    
    if (confirm("Importer et restaurer ce fichier .db écrasera la base de données actuelle. Continuer ?")) {
        fetch('/admin/api/backup/upload', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                showToast(data.message);
                form.reset();
                loadAnalytics();
                loadBackupsList();
            } else {
                showToast(data.message, "error");
            }
        })
        .catch(err => {
            console.error("Error uploading backup:", err);
            showToast("Erreur lors de l'importation.", "error");
        });
    }
}

// Password update form
function handlePasswordUpdate(e) {
    e.preventDefault();
    const old_password = document.getElementById('old_password').value;
    const new_password = document.getElementById('new_password').value;
    
    if (new_password.length < 8) {
        showToast("Le nouveau mot de passe doit comporter au moins 8 caractères.", "error");
        return;
    }
    
    fetch('/admin/api/update_password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ old_password, new_password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            showToast(data.message);
            document.getElementById('passwordForm').reset();
        } else {
            showToast(data.message, "error");
        }
    })
    .catch(err => {
        console.error("Error updating password:", err);
        showToast("Erreur de communication avec le serveur.", "error");
    });
}
