import spacy
import os
from backend.ai_models.food_classification.food_classifier import FoodClassifier
from backend.services.food_lookup_service import FoodLookupService
from backend.services.substitution_service import SubstitutionService

class FoodChatbot:
    def __init__(self, food_classifier_instance: FoodClassifier,
                 food_lookup_service_instance: FoodLookupService,
                 substitution_service_instance: SubstitutionService,
                 spacy_model_name="en_core_web_sm"):
        """
        Initializes the FoodChatbot with injected dependencies.

        Args:
            food_classifier_instance (FoodClassifier): An instance of FoodClassifier.
            food_lookup_service_instance (FoodLookupService): An instance of FoodLookupService.
            substitution_service_instance (SubstitutionService): An instance of SubstitutionService.
            spacy_model_name (str): The name of the spaCy model to load.
        """
        self.nlp = None
        self.food_classifier = food_classifier_instance
        self.food_lookup_service = food_lookup_service_instance
        self.substitution_service = substitution_service_instance
        self.all_models_loaded = False

        try:
            self.nlp = spacy.load(spacy_model_name)
            print(f"FoodChatbot: SpaCy model '{spacy_model_name}' loaded successfully.")

            if self.nlp and self.food_classifier and self.food_lookup_service and self.substitution_service:
                if hasattr(self.food_classifier, 'is_model_loaded') and not self.food_classifier.is_model_loaded():
                    print("FoodChatbot: WARNING - Injected FoodClassifier is not loaded.")
                    self.all_models_loaded = False
                else:
                    self.all_models_loaded = True
                    print("FoodChatbot: SpaCy and injected services/models are configured.")
            else:
                self.all_models_loaded = False
                print("FoodChatbot: WARNING - SpaCy loaded, but one or more injected services/models are missing. Functionality may be limited.")

        except Exception as e_init:
            print(f"FoodChatbot: CRITICAL ERROR during __init__ (e.g., spaCy model '{spacy_model_name}' not found): {e_init}")
            self.all_models_loaded = False
            if self.nlp is None and "Can't find model" in str(e_init) and "python -m spacy download" in str(e_init):
                print(f"Attempting to download spaCy model: {spacy_model_name}")
                try:
                    spacy.cli.download(spacy_model_name)
                    self.nlp = spacy.load(spacy_model_name)
                    if self.nlp:
                        print(f"Successfully downloaded and loaded spaCy model '{spacy_model_name}'. Re-checking overall status.")
                        if self.nlp and self.food_classifier and self.food_lookup_service and self.substitution_service:
                            if hasattr(self.food_classifier, 'is_model_loaded') and not self.food_classifier.is_model_loaded():
                                print("FoodChatbot: WARNING - Injected FoodClassifier is not loaded even after spaCy download.")
                                self.all_models_loaded = False
                            else:
                                self.all_models_loaded = True
                                print("FoodChatbot: SpaCy and injected services/models are now configured.")
                        else:
                             self.all_models_loaded = False
                except Exception as download_e:
                    print(f"Failed to download/load spaCy model '{spacy_model_name}' after attempting download: {download_e}")
                    self.all_models_loaded = False
            else:
                self.all_models_loaded = False


    def is_ready(self):
        """Checks if the chatbot and its core components are loaded."""
        return self.all_models_loaded

    def process_query(self, text_query, image_path=None):
        """
        Processes a user's query.

        Args:
            text_query (str): The text part of the user's query.
            image_path (str, optional): Path to an image file, if provided.

        Returns:
            dict: A dictionary containing the chatbot's response.
        """
        if not self.is_ready():
            return {"error": "Chatbot is not ready. Core models may have failed to load."}

        image_provided = image_path is not None
        intent, entities = self._recognize_intent(text_query, image_provided)

        response = self._handle_intent(intent, entities, text_query, image_path)

        return response

    def _recognize_intent(self, text_query, image_provided=False):
        """
        Recognizes the intent and entities from the user's query using spaCy.
        Now considers if an image was provided.
        """
        doc = self.nlp(text_query.lower())
        original_doc = self.nlp(text_query)
        intent = "unknown"
        entities = {}

        greeting_keywords = ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "yo"]
        website_info_keywords = ["what can you do", "what do you do", "what is this website", "what is this site", "help", "info", "capabilities"]
        who_are_you_keywords = ["who are you", "what is your name", "who made you", "tell me about yourself"]

        how_to_general_keywords = [
            "how to", "how do i", "where do i", "where can i", "show me how to",
            "guide me to", "steps for", "explain how to", "what are the steps to",
            "i want to", "i need to", "can i"
        ]
        how_to_topic_keywords = {
            "classify_image": ["classify image", "classify an image", "identify food from picture", "image classification", "scan food"],
            "browse_recipes": ["browse recipes", "find recipes", "see recipes", "look for recipes", "recipe browser"],
            "upload_recipe": ["upload recipe", "add a recipe", "submit new recipe", "share my recipe"],
            "meal_planner": ["meal planner", "meal plan", "plan my meals", "view meal plan"],
            "shopping_basket": ["shopping basket", "shopping list", "my basket", "view basket"],
            "user_settings": ["user settings", "my settings", "change my preferences", "account settings"],
            "change_password": ["change password", "update password", "reset my password", "new password"],
            "personalized_recipes": ["personalized recipes", "recipes for me", "my recommended recipes", "allergy friendly recipes"],
            "ingredient_substitute": ["ingredient substitute", "find substitute", "substitute an ingredient", "ingredient replacement"],
            "food_lookup": ["food lookup", "nutrition lookup", "check nutrition", "find food info", "lookup food"],
            "chatbot_help": ["chatbot", "talk to bot", "use chatbot", "chatbot page"]
        }

        classify_keywords = [
            "classify", "identify", "what is this", "what's this", "recognize this",
            "what food is this", "what am i looking at", "what food is in this picture",
            "tell me what this is a photo of", "can you identify this from the image",
            "what is in the image", "analyze this image"
        ]
        substitute_keywords = ["substitute", "substitution", "replacement", "instead of", "alternative for", "replace", "swap for"]
        nutrition_keywords = ["nutrition", "nutritional info", "calories", "how much protein", "is it healthy", "vitamins", "macros", "dietary fiber", "sugar content", "fat content"]

        if image_provided:
            if any(kw in doc.text for kw in classify_keywords) or \
               not text_query.strip() or \
               len(text_query.strip().split()) <= 3:
                 intent = "classify_food_image"

            if any(kw in doc.text for kw in nutrition_keywords):
                intent = "classify_food_image"
                entities["secondary_intent"] = "get_nutritional_info"
            elif any(kw in doc.text for kw in substitute_keywords):
                intent = "classify_food_image"
                entities["secondary_intent"] = "get_substitutes"
            elif intent == "unknown":
                intent = "classify_food_image"

        if intent == "unknown":
            if len(doc) == 1 and doc.text in website_info_keywords:
                intent = "website_info"
            elif any(keyword in doc.text for keyword in website_info_keywords):
                intent = "website_info"

            elif len(doc) == 1 and doc.text in who_are_you_keywords:
                intent = "who_are_you"
            elif any(keyword in doc.text for keyword in who_are_you_keywords):
                intent = "who_are_you"

            elif any(keyword in doc.text for keyword in greeting_keywords):
                intent = "general_greeting"

            elif any(keyword in doc.text for keyword in classify_keywords):
                intent = "classify_food_item"
                extracted_food_item = None
                for token in original_doc:
                    if token.lemma_.lower() in classify_keywords:
                        if token.i + 1 < len(original_doc):
                            if original_doc[token.i + 1].lemma_.lower() == "of":
                                if token.i + 2 < len(original_doc):
                                    obj_token = original_doc[token.i + 2]
                                    extracted_food_item = " ".join(t.text for t in obj_token.subtree).strip()
                                    break
                            elif original_doc[token.i + 1].pos_ in ["NOUN", "PROPN"] :
                                obj_token = original_doc[token.i+1]
                                extracted_food_item = " ".join(t.text for t in obj_token.subtree).strip()
                                break
                if not extracted_food_item:
                    for chunk in original_doc.noun_chunks:
                        if chunk.text.lower() in classify_keywords: continue
                        if chunk.root.dep_ in ("pobj", "dobj") and (chunk.root.head.lemma_.lower() in classify_keywords or (chunk.root.head.head and chunk.root.head.head.lemma_.lower() in classify_keywords)):
                             extracted_food_item = chunk.text
                             break
                if not extracted_food_item:
                    possible_items = [chunk.text for chunk in original_doc.noun_chunks if chunk.text.lower() not in classify_keywords]
                    if possible_items: extracted_food_item = max(possible_items, key=len)
                if extracted_food_item: entities["food_item"] = extracted_food_item

            elif any(keyword in doc.text for keyword in substitute_keywords):
                intent = "get_substitutes"
                extracted_food_item = None
                for token in original_doc:
                    if token.lemma_.lower() in substitute_keywords or (token.head and token.head.lemma_.lower() in substitute_keywords):
                        if token.i + 1 < len(original_doc) and original_doc[token.i + 1].lemma_.lower() in ["for", "of"]:
                            prep_token = original_doc[token.i + 1]
                            for child in prep_token.rights:
                                if child.dep_ == "pobj":
                                    extracted_food_item = " ".join(t.text for t in child.subtree).strip()
                                    break
                            if extracted_food_item: break
                if not extracted_food_item:
                    for chunk in original_doc.noun_chunks:
                        if chunk.text.lower() in substitute_keywords: continue
                        if (chunk.root.dep_ == "dobj" and chunk.root.head.lemma_.lower() in ["need", "find", "want", "give", "look"]) or \
                           (chunk.root.dep_ == "pobj" and chunk.root.head.lemma_.lower() in ["for", "of"] and \
                            (chunk.root.head.head.lemma_.lower() in substitute_keywords or chunk.root.head.head.lemma_.lower() in ["need", "find", "look"])):
                            extracted_food_item = chunk.text
                            break
                if not extracted_food_item:
                    possible_items = [chunk.text for chunk in original_doc.noun_chunks if chunk.text.lower() not in substitute_keywords]
                    if possible_items: extracted_food_item = max(possible_items, key=len)
                if extracted_food_item: entities["food_item"] = extracted_food_item

            elif any(keyword in doc.text for keyword in nutrition_keywords):
                intent = "get_nutritional_info"
                extracted_food_item = None
                for token in original_doc:
                    is_related_to_keyword = token.lemma_.lower() in nutrition_keywords
                    if not is_related_to_keyword and token.head:
                        is_related_to_keyword = token.head.lemma_.lower() in nutrition_keywords

                    if is_related_to_keyword:
                        target_search_start_index = token.i + 1

                        if token.head.lemma_.lower() in nutrition_keywords and token.dep_ == "prep":
                             target_search_start_index = token.i

                        for i in range(target_search_start_index, min(len(original_doc), target_search_start_index + 2)):
                            if original_doc[i].lemma_.lower() in ["for", "of", "in"]:
                                prep_token = original_doc[i]
                                for child in prep_token.rights:
                                    if child.dep_ == "pobj":
                                        extracted_food_item = " ".join(t.text for t in child.subtree).strip()
                                        break
                                if extracted_food_item: break
                        if extracted_food_item: break

                if not extracted_food_item:
                    for chunk in original_doc.noun_chunks:
                        if chunk.text.lower() in nutrition_keywords: continue
                        if (chunk.root.dep_ == "dobj" and chunk.root.head.lemma_.lower() in ["get", "find", "tell", "show", "list"]) or \
                           (chunk.root.dep_ == "pobj" and chunk.root.head.lemma_.lower() in ["for", "of", "in"] and \
                            (chunk.root.head.head.lemma_.lower() in nutrition_keywords or \
                             chunk.root.head.head.lemma_.lower() in ["get", "find", "tell", "show", "list"])):
                            extracted_food_item = chunk.text
                            break

                if not extracted_food_item:
                    possible_items = [chunk.text for chunk in original_doc.noun_chunks if chunk.text.lower() not in nutrition_keywords]
                    if possible_items:
                        extracted_food_item = max(possible_items, key=len)

                if extracted_food_item:
                    entities["food_item"] = extracted_food_item

            elif True:
                potential_topics_from_exact_match = []
                potential_topics_from_phrase_in_query = []
                has_general_how_to_keyword = any(ht_kw in doc.text for ht_kw in how_to_general_keywords)

                for topic_key, topic_phrases in how_to_topic_keywords.items():
                    if doc.text in topic_phrases:
                        potential_topics_from_exact_match.append(topic_key)
                        break

                current_matched_topic = None

                if potential_topics_from_exact_match:
                    current_matched_topic = potential_topics_from_exact_match[0]
                else:
                    for topic_key, topic_phrases in how_to_topic_keywords.items():
                        if any(phrase in doc.text for phrase in topic_phrases):
                            if has_general_how_to_keyword or len(doc.text.split()) <= 4:
                                current_matched_topic = topic_key
                                break

                if current_matched_topic:
                    intent = "get_how_to_link"
                    entities["how_to_topic"] = current_matched_topic

        if entities.get("food_item"):
            extracted_food_item_str = entities["food_item"]

            keywords_to_strip_from_entity = list(set(
                [kw.lower() for kw in nutrition_keywords] +
                [kw.lower() for kw in substitute_keywords] +
                [kw.lower() for kw in ["classify", "substitute", "nutrition", "calories", "replace", "for", "of", "in", "a", "an", "the", "show", "me", "tell", "give", "get", "find"]]
            ))
            keywords_to_strip_from_entity = [kw for kw in keywords_to_strip_from_entity if len(kw) > 1 or kw in ["a", "of", "in"]]


            item_tokens = extracted_food_item_str.split()
            while item_tokens and item_tokens[0].lower() in keywords_to_strip_from_entity:
                item_tokens.pop(0)
            while item_tokens and item_tokens[-1].lower() in keywords_to_strip_from_entity:
                item_tokens.pop()

            cleaned_item_after_keyword_strip = " ".join(item_tokens).strip()

            if cleaned_item_after_keyword_strip:
                temp_item_doc = self.nlp(cleaned_item_after_keyword_strip)
                final_clean_tokens = []
                has_noun_or_proper_noun = False

                for i, token in enumerate(temp_item_doc):
                    is_leading_det_or_prep = (token.pos_ in ["DET", "ADP"]) and i == 0 and len(temp_item_doc) > 1
                    is_trailing_det_or_prep = (token.pos_ in ["DET", "ADP"]) and i == len(temp_item_doc) - 1 and len(temp_item_doc) > 1

                    if token.pos_ in ["NOUN", "PROPN"]:
                        has_noun_or_proper_noun = True
                        final_clean_tokens.append(token.text)
                    elif token.pos_ in ["ADJ", "NUM"]:
                        final_clean_tokens.append(token.text)
                    elif token.pos_ == "CCONJ" and final_clean_tokens and final_clean_tokens[-1].lower() not in ["and", "or", "&"]:
                        final_clean_tokens.append(token.text)
                    elif token.tag_ == "VBN":
                        final_clean_tokens.append(token.text)
                    elif not (is_leading_det_or_prep or is_trailing_det_or_prep) and token.lemma_.lower() not in keywords_to_strip_from_entity:
                        pass


                final_cleaned_item = " ".join(final_clean_tokens).strip()

                if final_cleaned_item and has_noun_or_proper_noun:
                    entities["food_item"] = final_cleaned_item
                else:
                    if "food_item" in entities: del entities["food_item"]
            else:
                 if "food_item" in entities: del entities["food_item"]

        print(f"Recognized intent: {intent}, Entities: {entities} (Query: '{text_query}', Image provided: {image_provided})")
        return intent, entities

    def _handle_intent(self, intent, entities, text_query, image_path=None):
        """
        Handles the recognized intent and generates a response.
        """
        response_text = "I'm sorry, I didn't understand that. Can you please rephrase or try asking about food classification, substitutes, or nutrition?"

        if intent == "classify_food_image":
            if image_path and self.food_classifier and (not hasattr(self.food_classifier, 'is_model_loaded') or self.food_classifier.is_model_loaded()):
                predictions = self.food_classifier.predict_food(image_path)
                if predictions:
                    pred_strings = [f"{p['name']} ({p['confidence']:.0%})" for p in predictions[:3]]
                    classification_response = f"Top results: {', '.join(pred_strings)}."

                    secondary_intent = entities.get("secondary_intent")
                    if secondary_intent and predictions[0]['name']:
                        primary_food_item = predictions[0]['name']
                        secondary_response = ""
                        if secondary_intent == "get_nutritional_info" and self.food_lookup_service:
                            nutrition_data = self.food_lookup_service.lookup_food(primary_food_item, is_exact_match=True)
                            if nutrition_data and not nutrition_data.get("error") and nutrition_data.get("data"):
                                secondary_response = f" Nutritional info for {nutrition_data.get('food', primary_food_item)}: {self._format_nutrition(nutrition_data)}"
                            else:
                                secondary_response = f" Could not get nutritional info for {primary_food_item}. Error: {nutrition_data.get('error', 'Not found')}"
                        elif secondary_intent == "get_substitutes" and self.substitution_service:
                            subs_data, subs_error, _ = self.substitution_service.get_substitutes(primary_food_item)
                            if not subs_error and subs_data:
                                formatted_subs_parts = []
                                for sub_dict in subs_data:
                                    name = sub_dict.get("name")
                                    score = sub_dict.get("score")
                                    if name:
                                        if score is not None:
                                            try:
                                                score_float = float(score)
                                                formatted_subs_parts.append(f"{name} (Score: {score_float:.2f})")
                                            except ValueError:
                                                formatted_subs_parts.append(f"{name} (Score: {score})")
                                        else:
                                            formatted_subs_parts.append(name)
                                secondary_response = f" Substitutes for {primary_food_item}: {', '.join(formatted_subs_parts)}."
                            else:
                                secondary_response = f" No direct substitutes found for {primary_food_item} based on image. Error: {subs_error}"
                        response_text = f"Classified as '{primary_food_item}' ({predictions[0]['confidence']:.0%}).{secondary_response}"
                    else:
                        response_text = classification_response
                else:
                    response_text = "Could not classify the image."
            elif not image_path:
                response_text = "Please provide an image for classification."
            else:
                response_text = "Food image classification model is not available or not loaded."

        elif intent == "classify_food_item":
            food_item = entities.get("food_item")
            if food_item and self.food_lookup_service:
                nutrition_data = self.food_lookup_service.lookup_food(food_item, is_exact_match=True)
                if nutrition_data and not nutrition_data.get("error") and nutrition_data.get("data"):
                    response_text = f"I found nutritional data for '{nutrition_data.get('food', food_item)}', which suggests it's a recognized food. {self._format_nutrition(nutrition_data)}"
                else:
                    response_text = f"I couldn't find specific information for '{food_item}' in my food database. Error: {nutrition_data.get('error', 'Not found')}"
            elif not food_item:
                 response_text = "What food item are you asking about?"
            else:
                response_text = "Food lookup service is not available."

        elif intent == "get_substitutes":
            food_item_to_sub = entities.get("food_item")
            if not food_item_to_sub:
                return {"response": "What food item do you need a substitute for?"}

            if self.substitution_service:
                try:
                    substitutes_list_data, error_msg, status_code = self.substitution_service.get_substitutes(food_item_to_sub)

                    if error_msg:
                         return {"response": f"Could not retrieve substitutes for '{food_item_to_sub}': {error_msg}"}

                    if substitutes_list_data and isinstance(substitutes_list_data, list):
                        if not substitutes_list_data:
                            return {"response": f"No substitutes found for '{food_item_to_sub}'."}

                        formatted_subs_parts = []
                        for sub_dict in substitutes_list_data:
                            name = sub_dict.get("name")
                            score = sub_dict.get("score")
                            if name:
                                if score is not None:
                                    try:
                                        score_float = float(score)
                                        formatted_subs_parts.append(f"{name} (Score: {score_float:.2f})")
                                    except ValueError:
                                        formatted_subs_parts.append(f"{name} (Score: {score})")
                                else:
                                    formatted_subs_parts.append(name)

                        if not formatted_subs_parts:
                             return {"response": f"No valid substitute data found for '{food_item_to_sub}'."}

                        return {"response": f"Substitutes for '{food_item_to_sub}': {', '.join(formatted_subs_parts)}."}

                    elif substitutes_list_data is None and not error_msg :
                        return {"response": f"No substitutes found for '{food_item_to_sub}'."}

                    else:
                        return {"response": f"Could not retrieve substitute information for '{food_item_to_sub}' in the expected format. Data: {substitutes_list_data}"}
                except Exception as e:
                    print(f"FoodChatbot: Exception during substitution lookup for '{food_item_to_sub}': {e}")
                    return {"response": f"An unexpected error occurred while fetching substitutes for {food_item_to_sub}."}
            else:
                return {"response": "Substitution service is not available right now."}

        elif intent == "get_nutritional_info":
            food_item_to_lookup = entities.get("food_item")
            if not food_item_to_lookup:
                return {"response": "What food item do you need nutritional information for?"}

            if self.food_lookup_service:
                try:
                    nutrition_data = self.food_lookup_service.lookup_food(food_item_to_lookup, is_exact_match=False)

                    if nutrition_data.get("error"):
                        return {"response": f"Could not retrieve nutritional information for '{food_item_to_lookup}': {nutrition_data.get('error')}"}

                    if nutrition_data.get("matches") and isinstance(nutrition_data.get("matches"), list):
                        matches_list = sorted(list(set(nutrition_data["matches"])))

                        prompt_message = f"I found a few matches for '{food_item_to_lookup}'. Which one did you mean?"
                        if not matches_list:
                            prompt_message = f"I received a list of matches for '{food_item_to_lookup}', but it was empty. Could you try a different term?"

                        return {
                            "response": prompt_message,
                            "disambiguation_matches": matches_list
                        }

                    if nutrition_data.get("data") and isinstance(nutrition_data.get("data"), dict) and nutrition_data.get("food"):
                        formatted_nutrition = self._format_nutrition(nutrition_data)
                        return {"response": f"Nutrition for {nutrition_data['food']}: {formatted_nutrition}"}

                    return {"response": f"Could not retrieve specific nutritional details for '{food_item_to_lookup}'."}

                except Exception as e:
                    print(f"FoodChatbot: Exception during nutrition lookup for '{food_item_to_lookup}': {e}")
                    return {"response": f"An unexpected error occurred while fetching nutrition data for {food_item_to_lookup}."}
            else:
                return {"response": "Food lookup service is not available right now."}

        elif intent == "get_how_to_link":
            topic = entities.get("how_to_topic")
            response_data = {}

            if topic == "classify_image":
                response_data = {
                    "response": "To classify an image of a food item, go to the Ingredient Classifier page.",
                    "link_text": "Go to Ingredient Classifier",
                    "link_url": "/classifier"
                }
            elif topic == "browse_recipes":
                response_data = {
                    "response": "You can browse and search for recipes in the Public Recipe Browser.",
                    "link_text": "Browse Recipes",
                    "link_url": "/recipes"
                }
            elif topic == "upload_recipe":
                response_data = {
                    "response": "To upload your own recipe, you can use the recipe submission feature available in the recipe browser. Look for the 'Add Recipe' button.",
                    "link_text": "Browse Recipes (to add new ones)",
                    "link_url": "/recipes"
                }
            elif topic == "meal_planner":
                response_data = {
                    "response": "You can plan your meals using the Meal Planner.",
                    "link_text": "Open Meal Planner",
                    "link_url": "/meal-planner"
                }
            elif topic == "shopping_basket":
                response_data = {
                    "response": "View and manage your shopping list in the Shopping Basket.",
                    "link_text": "Go to Shopping Basket",
                    "link_url": "/basket"
                }
            elif topic == "user_settings":
                response_data = {
                    "response": "You can manage your account preferences, including allergies, in User Settings. You need to be logged in for this.",
                    "link_text": "Open User Settings",
                    "link_url": "/settings"
                }
            elif topic == "change_password":
                response_data = {
                    "response": "To change your password, go to User Settings. You need to be logged in.",
                    "link_text": "Manage Settings (for password change)",
                    "link_url": "/settings"
                }
            elif topic == "personalized_recipes":
                response_data = {
                    "response": "To see recipes tailored to your preferences and allergies, check out your Personalized Recipes feed. Make sure your allergies are set in User Settings and you are logged in.",
                    "link_text": "View Personalized Recipes",
                    "link_url": "/personalized-recipes"
                }
            elif topic == "ingredient_substitute":
                response_data = {
                    "response": "Need a substitute for an ingredient? Use the Ingredient Substitute tool.",
                    "link_text": "Find Ingredient Substitutes",
                    "link_url": "/ingredient-substitute"
                }
            elif topic == "food_lookup":
                response_data = {
                    "response": "To get nutritional information for food items, you can use the Food Lookup page or ask me directly (e.g., 'nutrition for apple').",
                    "link_text": "Go to Food Lookup Page",
                    "link_url": "/food-lookup"
                }
            elif topic == "chatbot_help":
                response_data = {
                    "response": "You are currently interacting with me, FoodieBot! You can ask me to classify food, find substitutes, get nutrition info, or ask how to use other features of the site.",
                    "link_text": "About this Chatbot",
                    "link_url": "/"
                }
            else:
                response_data = {
                    "response": "I can help you find information on how to use various features like recipe browsing, image classification, and more. Could you be more specific about what you'd like to do?"
                }
            return response_data

        elif intent == "general_greeting":
            response_text = "Hello! How can I help you with food today?"
        elif intent == "website_info":
            response_text = (
                "I can help you with NutriChef, your intelligent recipe and nutrition companion! Here's what you can do:\n\n"
                "- **Recipe Management:** Browse, search, and view detailed recipes. You can also upload your own recipes, either by filling out a form or by pasting text.\n"
                "- **Personalization:** Manage your allergies and get personalized recipe recommendations that suit your needs.\n"
                "- **AI-Powered Tools:**\n"
                "  - *Ingredient Classifier:* Upload an image of an ingredient, and I'll try to identify it.\n"
                "  - *Nutrition Lookup:* Ask for nutritional information for various food items.\n"
                "  - *Ingredient Substitution:* Find suitable substitutes for ingredients in your recipes.\n\n"
                "How can I assist you further?"
            )
        elif intent == "who_are_you":
            return {
                "response": "I am FoodieBot, your friendly culinary assistant!\n i was made by the NutriChef Admin Himan_M to help you with food-related queries.",
                "image_url": "https://via.placeholder.com/250/007bff/FFFFFF?Text=FoodieBot"
            }

        return {"response": response_text}

    def _format_nutrition(self, nutrition_data):
        """
        Formats nutrition data into a concise string.
        Selects key nutrients and handles missing data.
        """
        if not isinstance(nutrition_data, dict):
            return "Nutrition data is not in the expected dictionary format."

        actual_nutrient_dict = None
        if "data" in nutrition_data and isinstance(nutrition_data["data"], dict):
            actual_nutrient_dict = nutrition_data["data"]
        elif "nutrition" in nutrition_data and isinstance(nutrition_data["nutrition"], dict):
            actual_nutrient_dict = nutrition_data["nutrition"]
        else:
            service_error_msg = nutrition_data.get("error", "Missing 'data' or 'nutrition' key.")
            return f"Detailed nutrient information is not in the expected structure. Reason: {service_error_msg}"


        if not actual_nutrient_dict:
             return "No processable nutrient details found."

        key_nutrients_map = {
            "Caloric Value": ("Calories", "kcal"),
            "Protein": ("Protein", "g"),
            "Fat": ("Fat", "g"),
            "Carbohydrates": ("Carbohydrates", "g"),
            "Dietary Fiber": ("Fiber", "g"),
            "Sugars": ("Sugars", "g"),

            "Energy": ("Calories", "kcal"),
        }

        formatted_parts = []
        processed_display_names = set()

        for nutrient_key, (display_name, default_unit) in key_nutrients_map.items():
            if display_name in processed_display_names and display_name == "Calories":
                if "Caloric Value" in actual_nutrient_dict and nutrient_key == "Energy":
                    continue
            elif display_name in processed_display_names:
                 continue


            nutrient_info = actual_nutrient_dict.get(nutrient_key)

            if nutrient_info and isinstance(nutrient_info, dict):
                value = None
                unit = default_unit

                if "value" in nutrient_info:
                    value = nutrient_info["value"]
                    unit = nutrient_info.get("unit", default_unit).strip()
                elif "amount" in nutrient_info:
                    value = nutrient_info["amount"]
                    unit = nutrient_info.get("unit_name", default_unit).strip()

                if value is not None:
                    try:
                        val_float = float(value)
                        if val_float.is_integer():
                            formatted_value = str(int(val_float))
                        else:
                            formatted_value = f"{val_float:.1f}"
                            if formatted_value.endswith('.0'):
                                formatted_value = formatted_value[:-2]
                    except (ValueError, TypeError):
                        formatted_value = str(value)

                    formatted_parts.append(f"{display_name}: {formatted_value}{unit if unit else ''}")
                    processed_display_names.add(display_name)

        if not formatted_parts:
            return "No key nutritional information was found in the provided data."

        return ", ".join(formatted_parts) + " (approx. per 100g)."
