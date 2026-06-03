import sqlite3
import json
import random
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

DB_FILE = "survey.db"

NEIGHBORHOODS = ["Plateau", "Medina (Ancienne Ville)", "Biada", "Koudia", "Riad", "Saada", "Mouna", "Jrifat", "Ourida"]
SURNAMES = ["El Alami", "El Idrissi", "Alaoui", "Berrada", "Benjelloun", "Tazi", "Sabri", "Amrani", "Fassi", "Kabbaj"]
GENDERS = ["Une femme", "Un homme"]
AGES = ["18 – 24 ans", "25 – 34 ans", "35 – 49 ans", "50 – 64 ans", "65 ans et plus"]
DURATIONS = ["Depuis ma naissance", "Plus de 20 ans", "Entre 10 et 20 ans", "Entre 5 et 10 ans"]
EDUCATIONS = [
    "Sans scolarité / primaire",
    "Collège",
    "Lycée / baccalauréat",
    "Études supérieures (bac+2 à bac+4)",
    "Études supérieures (bac+5 et plus)"
]
PROFESSIONS = [
    "Élève / étudiant(e)",
    "Salarié(e) du secteur privé",
    "Fonctionnaire / secteur public",
    "Profession libérale / indépendant(e)",
    "Commerçant(e) / artisan(e)",
    "Sans emploi / en recherche",
    "Retraité(e)"
]

CINEMAS = [
    {"name": "Atlantide", "loc": "Plateau / Centre-ville", "states": ["Fermé et abandonné", "Ruiné", "Façade préservée"]},
    {"name": "Roxy", "loc": "Biada", "states": ["Transformé en commerce", "Démoli", "Fermé"]},
    {"name": "Regragui", "loc": "Medina", "states": ["Entrepôt", "Ruiné", "Fermé"]},
    {"name": "Cervantes", "loc": "Plateau", "states": ["Fermé", "En ruine"]},
    {"name": "Rialto", "loc": "Centre-ville", "states": ["Démoli", "Transformé en parking"]}
]

MEMORIES = [
    "Je me souviens d'aller au cinéma Atlantide tous les dimanches après-midi en famille. C'était magique, surtout l'architecture magnifique.",
    "Le cinéma Roxy était le point de rencontre des jeunes dans les années 90. Nous allions voir des films indiens fantastiques.",
    "Je garde en mémoire l'odeur du pop-corn et l'immense rideau rouge du cinéma Regragui. Une ambiance inoubliable.",
    "Les sorties du week-end avec mes amis d'enfance à l'Atlantide. C'est dommage de voir ce chef-d'œuvre architectural à l'abandon aujourd'hui.",
    "C'était notre seule fenêtre sur le monde culturel extérieur à Safi. Les films d'action américains remplissaient toujours la salle.",
    "Je me rappelle des longues files d'attente devant le Rialto pour voir les grands films marocains classiques."
]

MEANINGS = [
    "Nostalgie d'une époque glorieuse", "Un patrimoine culturel gâché", "Un abandon désolant",
    "La mémoire collective perdue de Safi", "Une richesse architecturale négligée",
    "Un grand vide culturel pour les jeunes", "Un symbole du déclin culturel"
]

COMMENTS = [
    "Il faut absolument que la commune réhabilite l'Atlantide en centre culturel ou en cinémathèque pour sauvegarder notre histoire.",
    "Les jeunes d'aujourd'hui ne connaissent rien de ces cinémas. C'est une grande perte culturelle.",
    "Safi a besoin d'espaces artistiques. Les anciennes salles fermées sont l'occasion parfaite pour créer des théâtres ou musées.",
    "Merci pour cette étude académique. Il est temps de réveiller la conscience collective sur notre patrimoine à Safi.",
    "Une simple plaque commémorative ou une restauration de la façade de l'Atlantide serait déjà un bon début."
]

def seed_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Check if database has entries
    cursor.execute("SELECT COUNT(*) FROM responses")
    count = cursor.fetchone()[0]
    
    if count > 0:
        print(f"Database already has {count} responses. Skipping seeding.")
        conn.close()
        return
        
    print("Seeding database with realistic mock data...")
    
    for i in range(1, 26): # Seed 25 surveys
        submission_date = (datetime.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))).strftime("%Y-%m-%d %H:%M:%S")
        
        gender = random.choice(GENDERS)
        age = random.choice(AGES)
        
        # Older people have been to cinema, younger ones might have not
        if "Moins de 18 ans" in age or "18 – 24 ans" in age:
            visited = random.choice(["Oui", "Non", "Non"]) # Higher chance of Non
        else:
            visited = "Oui"
            
        neighborhood = random.choice(NEIGHBORHOODS)
        duration = random.choice(DURATIONS)
        education = random.choice(EDUCATIONS)
        profession = random.choice(PROFESSIONS)
        
        # Default empty fields
        periods = []
        frequency = ""
        companions = []
        movie_types = []
        movie_other = ""
        memory = ""
        q13_text = ""
        what_became = []
        cinemas_to_insert = []
        
        if visited == "Oui":
            # Périodes
            if "65 ans" in age or "50 – 64 ans" in age:
                periods = random.sample(["Avant 1980", "Années 1980", "Années 1990"], random.randint(1, 3))
            elif "35 – 49 ans" in age:
                periods = random.sample(["Années 1990", "Années 2000"], random.randint(1, 2))
            else:
                periods = ["Années 2010 et après"]
                
            frequency = random.choice(["Plusieurs fois par semaine", "Environ une fois par semaine", "Une à deux fois par mois", "Quelques fois par an", "Rarement / occasionnellement"])
            companions = random.sample(["Seul(e)", "En famille", "Avec des amis", "En couple"], random.randint(1, 3))
            movie_types = random.sample(["Films marocains", "Films égyptiens / arabes", "Films indiens", "Films américains / occidentaux", "Films d'action / aventure"], random.randint(1, 3))
            if random.random() > 0.7:
                movie_other = "Cinéma d'auteur"
                
            memory = random.choice(MEMORIES)
            
            # Select random cinemas they remember
            remembered = random.sample(CINEMAS, random.randint(1, 3))
            q13_text = ", ".join([c['name'] for c in remembered])
            
            for rc in remembered:
                cinemas_to_insert.append({
                    "name": rc['name'],
                    "location": rc['loc'],
                    "state": random.choice(rc['states'])
                })
                
            what_became = random.sample(["Abandonnées / à l'état de ruine", "Transformées en commerces", "Démolies", "Transformées en entrepôts / parkings"], random.randint(1, 3))
            if random.random() > 0.8:
                what_became.append("Réaffectées à un autre usage culturel")
                
        # Likerts values
        q15 = [random.choice(["Plutôt oui", "Tout à fait", "Neutre"]) for _ in range(3)] # sat, streaming, piracy
        q15 += [random.choice(["Pas du tout", "Plutôt non", "Neutre"])] # price
        q15 += [random.choice(["Plutôt oui", "Tout à fait", "Neutre"]) for _ in range(2)] # vetuste, choice
        q15 += [random.choice(["Plutôt non", "Neutre", "Plutôt oui"])] # security
        q15 += [random.choice(["Tout à fait", "Plutôt oui", "Neutre"]) for _ in range(3)] # terrain, lack support, habits
        
        q16_cause = "Le manque de soutien public et la concurrence du streaming en ligne." if visited == "Oui" else "Le piratage des films et la télévision."
        
        # Q17 representations
        q17 = [random.choice(["Tout à fait", "Plutôt oui", "Neutre"]) for _ in range(6)]
        q18_meaning = random.choice(MEANINGS)
        
        # Q19 patrimony
        q19 = [random.choice(["Tout à fait", "Plutôt oui", "Neutre"]) for _ in range(6)]
        
        q20_usage = random.sample(["Une salle de cinéma de nouveau en activité", "Une cinémathèque / lieu de mémoire du cinéma", "Un centre culturel polyvalent", "Une médiathèque / bibliothèque", "Un café culturel / espace de rencontre"], random.randint(1, 3))
        q20_other = ""
        if random.random() > 0.8:
            q20_other = "Théâtre municipal"
            
        q21_support = random.sample(["En le fréquentant comme visiteur / public", "En participant à des actions bénévoles ou associatives", "En partageant des souvenirs, photos ou documents"], random.randint(1, 3))
        
        q22 = random.choice(["Oui", "Non"])
        q23 = []
        if q22 == "Oui":
            q23 = random.sample(["Presse écrite locale / nationale", "Réseaux sociaux (Facebook, Instagram, TikTok, YouTube…)", "Bouche-à-oreille / discussions"], random.randint(1, 2))
            
        q24 = random.choice(["Oui", "Non"])
        q25 = [random.choice(["Tout à fait", "Plutôt oui", "Neutre"]) for _ in range(3)]
        
        comments = random.choice(COMMENTS) if random.random() > 0.3 else ""
        recontact = random.choice(["Oui", "Non"])
        contact_details = f"06612345{random.randint(10,99)} ou mail{random.randint(1,10)}@mail.com" if recontact == "Oui" else ""
        
        cursor.execute('''
        INSERT INTO responses (
            submission_date, q1_gender, q2_age_group, q3_neighborhood, q4_residence_duration,
            q5_education_level, q6_profession, q7_visited_cinema, q8_periods, q9_frequency,
            q10_companions, q11_movie_types, q11_other, q12_memory, q13_text, q14_what_became,
            q15_1, q15_2, q15_3, q15_4, q15_5, q15_6, q15_7, q15_8, q15_9, q15_10, q16_main_cause,
            q17_1, q17_2, q17_3, q17_4, q17_5, q17_6, q18_meaning, q19_1, q19_2, q19_3, q19_4,
            q19_5, q19_6, q20_desired_usage, q20_other, q21_support_type, q22_seen_content,
            q23_channels, q24_follow_pages, q25_1, q25_2, q25_3, q26_comments, q27_recontact,
            q27_contact_details
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            submission_date, gender, age, neighborhood, duration,
            education, profession, visited, json.dumps(periods), frequency,
            json.dumps(companions), json.dumps(movie_types), movie_other, memory, q13_text, json.dumps(what_became),
            q15[0], q15[1], q15[2], q15[3], q15[4], q15[5], q15[6], q15[7], q15[8], q15[9], q16_cause,
            q17[0], q17[1], q17[2], q17[3], q17[4], q17[5], q18_meaning, q19[0], q19[1], q19[2], q19[3],
            q19[4], q19[5], json.dumps(q20_usage), q20_other, json.dumps(q21_support), q22,
            json.dumps(q23), q24, q25[0], q25[1], q25[2], comments, recontact,
            contact_details
        ))
        
        resp_id = cursor.lastrowid
        
        # Save Q13 table entries
        for rcin in cinemas_to_insert:
            cursor.execute('''
            INSERT INTO cinema_mentions (response_id, name, location, current_state)
            VALUES (?, ?, ?, ?)
            ''', (resp_id, rcin['name'], rcin['location'], rcin['state']))
            
    conn.commit()
    conn.close()
    print("Database seeding completed.")

if __name__ == "__main__":
    seed_db()
