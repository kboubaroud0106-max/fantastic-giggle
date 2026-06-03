import pandas as pd
import numpy as np
import re
from collections import Counter

# Standard French stop words to filter out from word clouds
FRENCH_STOP_WORDS = {
    'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'en', 'dans', 'pour', 'sur', 
    'qui', 'que', 'se', 'par', 'ou', 'avec', 'plus', 'ce', 'cette', 'ces', 'aux', 'pas', 
    'mais', 'est', 'sont', 'ont', 'a', 'y', 'ne', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 
    'ils', 'elles', 'mon', 'ton', 'son', 'notre', 'votre', 'leur', 'mes', 'tes', 'ses', 
    'nos', 'vos', 'leurs', 'donc', 'car', 'parce', 'chez', 'sous', 'vers', 'dans', 'tout',
    'tous', 'toute', 'toutes', 'comme', 'faire', 'fait', 'plusieurs', 'sans', 'c', 'd', 'j',
    'l', 'm', 'n', 's', 't', 'qu', 'mème', 'meme', 'très', 'tres', 'si', 'bien', 'être', 'avoir',
    'aussi', 'alors', 'peut', 'leurs', 'leurs', 'dehors', 'après', 'apres', 'avant', 'depuis',
    'cinéma', 'cinemas', 'salle', 'salles', 'safi', 'ville', 'cinema', 'ferme', 'fermes', 'fermé', 'fermés',
    'salle', 'salles', 'leurs', 'lesquelles', 'lesquels', 'cet', 'cette', 'ceux', 'celles'
}

LIKERT_MAPPING = {
    "Pas du tout": 1,
    "Plutôt non": 2,
    "Neutre": 3,
    "Plutôt oui": 4,
    "Tout à fait": 5
}

REVERSE_LIKERT_MAPPING = {v: k for k, v in LIKERT_MAPPING.items()}

def calculate_single_choice_stats(df, column_name):
    if df.empty or column_name not in df.columns:
        return {"total": 0, "distribution": {}, "chart_data": {"labels": [], "values": [], "percentages": []}}
        
    counts = df[column_name].value_counts()
    total = int(df[column_name].notna().sum())
    
    distribution = {}
    labels = []
    values = []
    percentages = []
    
    for val, count in counts.items():
        if pd.isna(val) or val == "":
            continue
        cnt = int(count)
        pct = round((cnt / total * 100), 1) if total > 0 else 0
        distribution[val] = {"count": cnt, "percentage": pct}
        labels.append(str(val))
        values.append(cnt)
        percentages.append(pct)
        
    return {
        "total": total,
        "distribution": distribution,
        "chart_data": {
            "labels": labels,
            "values": values,
            "percentages": percentages
        }
    }

def calculate_multi_choice_stats(df, column_name):
    if df.empty or column_name not in df.columns:
        return {"total_respondents": 0, "frequencies": {}, "chart_data": {"labels": [], "values": [], "percentages": []}}
        
    total_respondents = len(df)
    all_choices = []
    
    for val in df[column_name]:
        if isinstance(val, list):
            all_choices.extend(val)
        elif isinstance(val, str):
            try:
                import json
                choices = json.loads(val)
                if isinstance(choices, list):
                    all_choices.extend(choices)
            except Exception:
                # Comma separated fallback
                choices = [c.strip() for c in val.split(',') if c.strip()]
                all_choices.extend(choices)
                
    counts = Counter(all_choices)
    
    frequencies = {}
    labels = []
    values = []
    percentages = [] # Percentage of respondents who selected this option
    
    # Sort by frequency
    for val, count in counts.most_common():
        cnt = int(count)
        pct = round((cnt / total_respondents * 100), 1) if total_respondents > 0 else 0
        frequencies[val] = {"count": cnt, "percentage": pct}
        labels.append(str(val))
        values.append(cnt)
        percentages.append(pct)
        
    return {
        "total_respondents": total_respondents,
        "frequencies": frequencies,
        "chart_data": {
            "labels": labels,
            "values": values,
            "percentages": percentages
        }
    }

def calculate_likert_stats(df, items):
    """
    items: dict mapping column_name to its label/statement
    """
    if df.empty:
        return {}
        
    stats = {}
    global_scores = []
    
    for col, statement in items.items():
        if col not in df.columns:
            continue
            
        series = df[col].dropna()
        series = series[series != ""]
        total = len(series)
        
        if total == 0:
            stats[col] = {
                "statement": statement,
                "total": 0,
                "mean": 0,
                "median": "N/A",
                "distribution": {label: 0 for label in LIKERT_MAPPING.keys()},
                "chart_data": [0, 0, 0, 0, 0]
            }
            continue
            
        # Map values to numbers
        numeric_values = series.map(LIKERT_MAPPING).dropna()
        mean = float(np.round(numeric_values.mean(), 2)) if not numeric_values.empty else 0.0
        median_num = int(np.median(numeric_values)) if not numeric_values.empty else 3
        median = REVERSE_LIKERT_MAPPING.get(median_num, "Neutre")
        
        global_scores.append(mean)
        
        # Calculate counts
        counts = series.value_counts()
        dist = {}
        chart_data = []
        
        for label in ["Pas du tout", "Plutôt non", "Neutre", "Plutôt oui", "Tout à fait"]:
            cnt = int(counts.get(label, 0))
            pct = round((cnt / total * 100), 1) if total > 0 else 0
            dist[label] = {"count": cnt, "percentage": pct}
            chart_data.append(cnt)
            
        stats[col] = {
            "statement": statement,
            "total": total,
            "mean": mean,
            "median": median,
            "distribution": dist,
            "chart_data": chart_data # order matches [Pas du tout, Plutôt non, Neutre, Plutôt oui, Tout à fait]
        }
        
    global_score = float(np.round(np.mean(global_scores), 2)) if global_scores else 0.0
    
    return {
        "items": stats,
        "global_score": global_score # Average score across all statements
    }

def clean_text_and_tokenize(text):
    if not text or not isinstance(text, str):
        return []
    # Replace non-alphabetic characters (including Arabic letters if any, but focus on French accents)
    # Using regex to match words
    words = re.findall(r'\b[a-zA-Zéèàùçâêîôûëïüê\'\-]+\b', text.lower())
    # Filter short words and stop words
    filtered_words = []
    for w in words:
        # handle apostrophes e.g. l'histoire -> histoire
        if "'" in w:
            parts = w.split("'")
            w = parts[-1]
        if len(w) > 2 and w not in FRENCH_STOP_WORDS:
            filtered_words.append(w)
    return filtered_words

def analyze_open_responses(df, column_name):
    if df.empty or column_name not in df.columns:
        return {"total_responses": 0, "verbatims": [], "word_frequencies": []}
        
    series = df[column_name].dropna()
    series = series[series.str.strip() != ""]
    
    verbatims = series.tolist()
    total_responses = len(verbatims)
    
    all_tokens = []
    for text in verbatims:
        all_tokens.extend(clean_text_and_tokenize(text))
        
    word_counts = Counter(all_tokens)
    word_frequencies = []
    
    for word, count in word_counts.most_common(100): # Top 100 words
        word_frequencies.append({
            "text": word,
            "value": int(count)
        })
        
    return {
        "total_responses": total_responses,
        "verbatims": verbatims,
        "word_frequencies": word_frequencies
    }

def analyze_cinema_mentions(mentions_list):
    """
    Analyzes custom table entries for Q13.
    """
    total = len(mentions_list)
    if total == 0:
        return {"total": 0, "names": [], "locations": [], "states": []}
        
    names = [m['name'].strip() for m in mentions_list if m.get('name')]
    locations = [m['location'].strip() for m in mentions_list if m.get('location')]
    states = [m['current_state'].strip() for m in mentions_list if m.get('current_state')]
    
    name_counts = Counter(names).most_common(20)
    location_counts = Counter(locations).most_common(20)
    state_counts = Counter(states).most_common(20)
    
    return {
        "total": total,
        "names": [{"text": name, "count": count} for name, count in name_counts],
        "locations": [{"text": loc, "count": count} for loc, count in location_counts],
        "states": [{"text": st, "count": count} for st, count in state_counts]
    }

def compile_full_stats(responses, filters=None):
    """
    Compiles all statistics for the admin dashboard.
    """
    if not responses:
        # Return empty template
        return {}
        
    df = pd.DataFrame(responses)
    
    # 1. Profil (Section A)
    stats_q1 = calculate_single_choice_stats(df, 'q1_gender')
    stats_q2 = calculate_single_choice_stats(df, 'q2_age_group')
    stats_q3 = analyze_open_responses(df, 'q3_neighborhood') # treated as text frequency
    stats_q4 = calculate_single_choice_stats(df, 'q4_residence_duration')
    stats_q5 = calculate_single_choice_stats(df, 'q5_education_level')
    stats_q6 = calculate_single_choice_stats(df, 'q6_profession')
    
    # 2. Memoire (Section B)
    stats_q7 = calculate_single_choice_stats(df, 'q7_visited_cinema')
    
    # Check if they ever went to cinema (filter for B and C)
    df_visited = df[df['q7_visited_cinema'] == 'Oui'] if 'q7_visited_cinema' in df.columns else df
    
    stats_q8 = calculate_multi_choice_stats(df_visited, 'q8_periods')
    stats_q9 = calculate_single_choice_stats(df_visited, 'q9_frequency')
    stats_q10 = calculate_multi_choice_stats(df_visited, 'q10_companions')
    stats_q11 = calculate_multi_choice_stats(df_visited, 'q11_movie_types')
    stats_q12 = analyze_open_responses(df_visited, 'q12_memory')
    
    # 3. Connaissance (Section C)
    stats_q13_text = analyze_open_responses(df_visited, 'q13_text')
    
    # Process cinema table entries
    all_mentions = []
    for r in responses:
        if r.get('q7_visited_cinema') == 'Oui':
            all_mentions.extend(r.get('q13_table', []))
    stats_q13_table = analyze_cinema_mentions(all_mentions)
    
    stats_q14 = calculate_multi_choice_stats(df_visited, 'q14_what_became')
    
    # 4. Causes fermeture (Section D)
    q15_items = {
        'q15_1': "La télévision et les chaînes satellitaires ont détourné le public.",
        'q15_2': "Internet, le streaming et le téléchargement ont remplacé la salle.",
        'q15_3': "Le piratage des films a nui aux salles.",
        'q15_4': "Le prix des billets était devenu trop élevé.",
        'q15_5': "Les salles étaient vétustes et mal entretenues.",
        'q15_6': "La qualité ou le choix des films proposés s'est dégradé.",
        'q15_7': "Le sentiment d'insécurité ou la mauvaise réputation des salles.",
        'q15_8': "La hausse de la valeur des terrains a poussé à vendre les salles.",
        'q15_9': "Le manque de soutien des pouvoirs publics à ces salles.",
        'q15_10': "Les habitudes de sortie et de loisirs ont changé."
    }
    stats_q15 = calculate_likert_stats(df, q15_items)
    stats_q16 = analyze_open_responses(df, 'q16_main_cause')
    
    # 5. Representations (Section E)
    q17_items = {
        'q17_1': "Ces anciennes salles me rappellent de bons souvenirs.",
        'q17_2': "Leur fermeture représente une perte pour la ville de Safi.",
        'q17_3': "Leur état actuel me paraît dégradé et désolant.",
        'q17_4': "Je me sens personnellement attaché(e) à ces lieux.",
        'q17_5': "Ces salles font partie de l'identité de Safi.",
        'q17_6': "Les jeunes générations ignorent l'histoire de ces salles."
    }
    stats_q17 = calculate_likert_stats(df, q17_items)
    stats_q18 = analyze_open_responses(df, 'q18_meaning')
    
    # 6. Patrimoine et avenir (Section F)
    q19_items = {
        'q19_1': "Ces salles font partie du patrimoine culturel de Safi.",
        'q19_2': "Il faudrait préserver et réhabiliter au moins certaines d'entre elles.",
        'q19_3': "Leur réhabilitation pourrait dynamiser le centre-ville.",
        'q19_4': "Leur valorisation pourrait créer des emplois et des activités.",
        'q19_5': "Je fréquenterais un lieu culturel créé dans une ancienne salle.",
        'q19_6': "Les habitants devraient être associés aux décisions les concernant."
    }
    stats_q19 = calculate_likert_stats(df, q19_items)
    stats_q20 = calculate_multi_choice_stats(df, 'q20_desired_usage')
    stats_q21 = calculate_multi_choice_stats(df, 'q21_support_type')
    
    # 7. Info et medias (Section G)
    stats_q22 = calculate_single_choice_stats(df, 'q22_seen_content')
    stats_q23 = calculate_multi_choice_stats(df, 'q23_channels')
    stats_q24 = calculate_single_choice_stats(df, 'q24_follow_pages')
    
    q25_items = {
        'q25_1': "On parle trop peu de ces salles dans les médias locaux.",
        'q25_2': "Les réseaux sociaux pourraient aider à faire connaître ce patrimoine.",
        'q25_3': "J'aimerais en savoir plus sur l'histoire de ces salles."
    }
    stats_q25 = calculate_likert_stats(df, q25_items)
    
    # 8. Suggestions (Section H)
    stats_q26 = analyze_open_responses(df, 'q26_comments')
    stats_q27 = calculate_single_choice_stats(df, 'q27_recontact')
    
    return {
        "count": len(df),
        "q1": stats_q1, "q2": stats_q2, "q3": stats_q3, "q4": stats_q4, "q5": stats_q5, "q6": stats_q6,
        "q7": stats_q7, "q8": stats_q8, "q9": stats_q9, "q10": stats_q10, "q11": stats_q11, "q12": stats_q12,
        "q13_text": stats_q13_text, "q13_table": stats_q13_table, "q14": stats_q14,
        "q15": stats_q15, "q16": stats_q16, "q17": stats_q17, "q18": stats_q18,
        "q19": stats_q19, "q20": stats_q20, "q21": stats_q21,
        "q22": stats_q22, "q23": stats_q23, "q24": stats_q24, "q25": stats_q25,
        "q26": stats_q26, "q27": stats_q27
    }
