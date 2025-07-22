import pandas as pd
import spacy
import os
from backend.utils.logging_utils import log_success, log_error, log_warning

class SubstitutionRecommender:
    RETAIN_ADJECTIVES = {
        'virgin', 'extra', 'cold', 'pressed', 'pure', 'raw',
        'balsamic', 'sesame', 'coconut', 'dark', 'light', 'hot',
        'sweet', 'bitter', 'white', 'black', 'red', 'green', 'olive'
    }

    def __init__(self, data_file_path=None, spacy_model_name="en_core_web_sm"):
        """
        Initializes the SubstitutionRecommender.
        :param data_file_path: Path to the 'sub_normalized.csv' file.
                               If None, defaults to 'sub_normalized.csv' in the same directory as this script.
        :param spacy_model_name: Name of the spacy model to load.
        """
        if data_file_path is None:
            data_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sub_normalized.csv')

        self.nlp = None
        self.df_substitutes = None
        self.model_loaded = False

        try:
            self.nlp = spacy.load(spacy_model_name, disable=["parser", "ner"])
            log_success(f"SpaCy model '{spacy_model_name}' loaded.", "SubstitutionRecommender")

            if not os.path.exists(data_file_path):
                raise FileNotFoundError(f"'sub_normalized.csv' not found at {data_file_path}. User needs to place it here.")
            self.df_substitutes = pd.read_csv(data_file_path)
            log_success(f"Substitutes data loaded from '{data_file_path}'.", "SubstitutionRecommender")
            
            expected_cols = ['normalized_ingredient', 'normalized_substitute']
            if not all(col in self.df_substitutes.columns for col in expected_cols):
                raise ValueError(f"CSV file must contain columns: {', '.join(expected_cols)}")

            self.model_loaded = True
            log_success("Initialization successful.", "SubstitutionRecommender")

        except FileNotFoundError as fnf_error:
            log_error(str(fnf_error), "SubstitutionRecommender")
        except ValueError as ve_error:
            log_error(str(ve_error), "SubstitutionRecommender")
        except Exception as e:
            log_error(f"initializing - {e}. Ensure '{spacy_model_name}' is downloaded (python -m spacy download {spacy_model_name}).", "SubstitutionRecommender")

    def is_ready(self):
        return self.model_loaded

    def normalize_ingredient(self, ingredient_text):
        if not self.is_ready():
            raise RuntimeError("SubstitutionRecommender is not ready. Cannot normalize.")
        
        doc = self.nlp(ingredient_text.lower())
        retained_lemmas = []

        for token in doc:
            if token.pos_ in ("NOUN", "PROPN"):
                retained_lemmas.append(token.lemma_)
            elif token.pos_ == "ADJ" and token.lemma_ in self.RETAIN_ADJECTIVES:
                retained_lemmas.append(token.lemma_)
        
        normalized = " ".join(retained_lemmas)
        return normalized if normalized else ingredient_text.lower().strip()

    def get_substitutes(self, input_ingredient, top_n=5):
        if not self.is_ready():
            log_warning("Not ready. Cannot get substitutes.", "SubstitutionRecommender")
            return []

        try:
            normalized_input = self.normalize_ingredient(input_ingredient)
            if not normalized_input:
                return []

            from_ingredient = self.df_substitutes[self.df_substitutes['normalized_ingredient'] == normalized_input]
            subs_from_ingredient_col = from_ingredient['normalized_substitute'].tolist()

            from_substitute_col = self.df_substitutes[self.df_substitutes['normalized_substitute'] == normalized_input]
            subs_from_substitute_col = from_substitute_col['normalized_ingredient'].tolist()

            all_subs_list = subs_from_ingredient_col + subs_from_substitute_col
            
            if not all_subs_list:
                return []

            sub_counts = pd.Series(all_subs_list).value_counts().reset_index()
            sub_counts.columns = ['name', 'score']

            if not sub_counts.empty:
                 sub_counts['score'] = sub_counts['score'] / sub_counts['score'].max()
            else:
                return []

            sub_counts_sorted = sub_counts.sort_values(by=['score', 'name'], ascending=[False, True])
            
            top_results = sub_counts_sorted.head(top_n)
            
            return top_results.to_dict(orient='records')
            
        except Exception as e:
            log_error(f"Error during get_substitutes for '{input_ingredient}' - {e}", "SubstitutionRecommender")
            return []
