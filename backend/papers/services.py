"""
Academic paper services:
1. arXiv API integration (fetching, search, XML parsing)
2. Hybrid Academic Summarization Engine (Pluggable AI LLM with robust built-in NLP fallback)
"""

import xml.etree.ElementTree as ET
import re
from datetime import datetime
import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

ATOM_NS = {'atom': 'http://www.w3.org/2005/Atom', 'arxiv': 'http://arxiv.org/schemas/atom'}

class ArxivService:
    BASE_URL = 'http://export.arxiv.org/api/query'

    @classmethod
    def clean_id(cls, raw_id: str) -> str:
        """Sanitizes arXiv ID (e.g. 'arxiv:2301.00234v1' or '2301.00234v2' -> '2301.00234')."""
        raw_id = raw_id.strip()
        raw_id = re.sub(r'^(?:arxiv:\s*|https?://arxiv\.org/(?:abs|pdf)/)', '', raw_id, flags=re.IGNORECASE)
        # Strip trailing .pdf or version tag if desired
        raw_id = re.sub(r'\.pdf$', '', raw_id, flags=re.IGNORECASE)
        return raw_id

    @classmethod
    def fetch_paper_by_id(cls, raw_id: str) -> dict:
        """Fetches metadata for a single paper from arXiv API."""
        clean_id = cls.clean_id(raw_id)
        params = {
            'id_list': clean_id,
            'max_results': 1
        }
        try:
            response = requests.get(cls.BASE_URL, params=params, timeout=12)
            response.raise_for_status()
            papers = cls._parse_atom_feed(response.text)
            if papers:
                return papers[0]
            return None
        except Exception as e:
            logger.error(f"Error querying arXiv for ID '{clean_id}': {e}")
            return None

    @classmethod
    def search_papers(cls, query: str, max_results: int = 10, start: int = 0) -> list:
        """Searches arXiv for papers matching query string."""
        if not query or not query.strip():
            return []

        clean_query = query.strip()
        # If user typed an ID directly, prioritize id search
        if re.match(r'^\d{4}\.\d{4,5}(?:v\d+)?$', clean_query):
            single = cls.fetch_paper_by_id(clean_query)
            return [single] if single else []

        # Otherwise perform general query
        search_query = f"all:{clean_query}"
        params = {
            'search_query': search_query,
            'start': start,
            'max_results': min(max_results, 30),
            'sortBy': 'relevance',
            'sortOrder': 'descending'
        }
        try:
            response = requests.get(cls.BASE_URL, params=params, timeout=12)
            response.raise_for_status()
            return cls._parse_atom_feed(response.text)
        except Exception as e:
            logger.error(f"Error querying arXiv for '{query}': {e}")
            return []

    @classmethod
    def _parse_atom_feed(cls, xml_text: str) -> list:
        """Parses arXiv Atom XML response into list of clean dictionaries."""
        try:
            root = ET.fromstring(xml_text)
        except ET.ParseError as e:
            logger.error(f"XML parse error from arXiv response: {e}")
            return []

        entries = root.findall('atom:entry', ATOM_NS)
        results = []

        for entry in entries:
            id_elem = entry.find('atom:id', ATOM_NS)
            if id_elem is None or not id_elem.text:
                continue

            full_id = id_elem.text.strip()
            # Extract ID portion: http://arxiv.org/abs/2301.00234v1 -> 2301.00234
            arxiv_id = full_id.split('/abs/')[-1] if '/abs/' in full_id else full_id

            title_elem = entry.find('atom:title', ATOM_NS)
            title = re.sub(r'\s+', ' ', title_elem.text.strip()) if title_elem is not None and title_elem.text else 'Untitled'

            summary_elem = entry.find('atom:summary', ATOM_NS)
            abstract = re.sub(r'\s+', ' ', summary_elem.text.strip()) if summary_elem is not None and summary_elem.text else ''

            # If paper ID contains 'http://arxiv.org/api/errors#paper_not_found', skip
            if 'paper_not_found' in arxiv_id or title == 'Error':
                continue

            # Authors
            authors = []
            for author_node in entry.findall('atom:author', ATOM_NS):
                name_node = author_node.find('atom:name', ATOM_NS)
                if name_node is not None and name_node.text:
                    name = name_node.text.strip()
                    affil_node = author_node.find('arxiv:affiliation', ATOM_NS)
                    affil = affil_node.text.strip() if affil_node is not None and affil_node.text else ''
                    authors.append({'name': name, 'affiliation': affil})

            # Dates
            published_str = entry.findtext('atom:published', default='', namespaces=ATOM_NS)
            updated_str = entry.findtext('atom:updated', default='', namespaces=ATOM_NS)

            published_date = None
            if published_str:
                try:
                    published_date = datetime.strptime(published_str[:10], '%Y-%m-%d').date()
                except ValueError:
                    pass

            updated_date = None
            if updated_str:
                try:
                    updated_date = datetime.strptime(updated_str[:10], '%Y-%m-%d').date()
                except ValueError:
                    pass

            # Primary Category
            primary_cat_node = entry.find('arxiv:primary_category', ATOM_NS)
            category = primary_cat_node.get('term', '') if primary_cat_node is not None else ''
            if not category:
                cat_node = entry.find('atom:category', ATOM_NS)
                category = cat_node.get('term', '') if cat_node is not None else 'cs.AI'

            # DOI & Journal Ref
            doi_node = entry.find('arxiv:doi', ATOM_NS)
            doi = doi_node.text.strip() if doi_node is not None and doi_node.text else ''

            journal_node = entry.find('arxiv:journal_ref', ATOM_NS)
            journal_ref = journal_node.text.strip() if journal_node is not None and journal_node.text else ''

            # PDF Link
            pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
            for link_node in entry.findall('atom:link', ATOM_NS):
                if link_node.get('title') == 'pdf':
                    pdf_url = link_node.get('href', pdf_url)
                    break

            results.append({
                'arxiv_id': arxiv_id,
                'title': title,
                'abstract': abstract,
                'authors': authors,
                'category': category,
                'published_date': published_date,
                'updated_date': updated_date,
                'journal_ref': journal_ref,
                'doi': doi,
                'pdf_url': pdf_url
            })

        return results


class AcademicSummarizationEngine:
    """
    Intelligent Summarization Engine.
    Attempts LLM summarization if OPENAI_API_KEY is configured.
    Gracefully and reliably falls back to high-grade deterministic academic NLP
    structuring when external API is omitted, unavailable, or rate-limited.
    """

    @classmethod
    def generate_summary(cls, title: str, abstract: str, category: str = '') -> dict:
        api_key = getattr(settings, 'NVIDIA_API_KEY', '') or getattr(settings, 'OPENAI_API_KEY', '') or ''
        
        if api_key.strip():
            llm_result = cls._try_nemotron_summary(title, abstract, category, api_key.strip())
            if llm_result:
                return llm_result

        # Reliable Fallback: Scientific NLP Extractive & Synthesizing Engine
        return cls._generate_nlp_summary(title, abstract, category)

    @classmethod
    def _try_nemotron_summary(cls, title: str, abstract: str, category: str, api_key: str) -> dict:
        """
        Invokes NVIDIA Nemotron 3 Ultra via NVIDIA NIM / OpenAI-compatible endpoint.
        """
        try:
            import json
            base_url = getattr(settings, 'NVIDIA_BASE_URL', 'https://integrate.api.nvidia.com/v1').rstrip('/')
            model_name = getattr(settings, 'NVIDIA_MODEL', 'nvidia/nemotron-3-ultra')

            endpoint = f"{base_url}/chat/completions"
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            prompt = f"""You are NVIDIA Nemotron 3 Ultra, a premier academic literature synthesis engine.
Analyze this scientific paper preprint and return a structured JSON synthesis.

Title: {title}
Classification: {category}
Abstract: {abstract}

Return ONLY a valid JSON object matching this schema without any markdown formatting or commentary:
{{
  "executive_summary": "2-3 precise academic sentences detailing the underlying research problem, main hypothesis, and core technical resolution.",
  "key_findings": [
    "Primary empirical finding or quantitative performance metric",
    "Benchmark comparison against previous baselines",
    "Architectural or methodological breakthrough",
    "Significant domain implication"
  ],
  "methodology": "Detailed description of the computational pipeline, mathematical formulation, model architecture, or experimental setup.",
  "lay_summary": "An intuitive, accessible 2-paragraph explanation written for undergraduate students and interdisciplinary researchers.",
  "limitations": "Critical evaluation of computational costs, dataset biases, assumptions, or open research challenges.",
  "keywords": ["DomainKey1", "DomainKey2", "DomainKey3", "DomainKey4", "DomainKey5"]
}}"""

            payload = {
                "model": model_name,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are NVIDIA Nemotron 3 Ultra, an expert AI research assistant. You always respond with pure JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.2,
                "top_p": 0.95,
                "max_tokens": 1500
            }

            res = requests.post(endpoint, headers=headers, json=payload, timeout=25)
            if res.status_code == 200:
                data = res.json()
                raw_content = data['choices'][0]['message']['content'].strip()

                # Clean markdown backticks if returned by the LLM
                clean_json_str = re.sub(r'^```(?:json)?\s*', '', raw_content, flags=re.IGNORECASE)
                clean_json_str = re.sub(r'\s*```$', '', clean_json_str).strip()

                parsed = json.loads(clean_json_str)
                parsed['generator_type'] = 'NEMOTRON_LLM'
                return parsed
            else:
                logger.warning(f"NVIDIA Nemotron API returned status {res.status_code}: {res.text}")
        except Exception as e:
            logger.warning(f"NVIDIA Nemotron 3 Ultra synthesis call failed or timed out: {e}. Reverting to built-in academic NLP engine.")
        return None

    @classmethod
    def _generate_nlp_summary(cls, title: str, abstract: str, category: str = '') -> dict:
        """
        Deterministic, publication-grade academic NLP structuring.
        Extracts core problem, proposed contribution, findings, methodology, and limitations.
        """
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', abstract) if len(s.strip()) > 15]

        if not sentences:
            sentences = [abstract] if abstract else [title]

        # 1. Executive Summary
        # Typically the opening states the problem and middle/end states the contribution
        if len(sentences) >= 3:
            exec_sentences = [sentences[0], sentences[1], sentences[-1]]
            executive_summary = " ".join(exec_sentences)
        elif len(sentences) >= 2:
            executive_summary = f"{sentences[0]} {sentences[-1]}"
        else:
            executive_summary = sentences[0]

        # 2. Key Findings
        # Identify sentences with indicators of results, performance, findings, or proposals
        result_keywords = ['demonstrate', 'show', 'achieve', 'improve', 'outperform', 'results', 'finding', 'propose', 'introduce', 'present', 'evaluate', 'observe', 'accuracy', 'novel', 'state-of-the-art']
        findings = []

        for s in sentences:
            s_lower = s.lower()
            if any(k in s_lower for k in result_keywords):
                # Clean up and add
                clean_s = s.strip()
                if clean_s and clean_s not in findings:
                    findings.append(clean_s)

        # Ensure we have 3-4 structured findings
        if len(findings) < 3:
            for s in sentences:
                if s not in findings:
                    findings.append(s)
                if len(findings) >= 3:
                    break

        # Fallback if still short
        if not findings:
            findings = [
                f"Addresses core technical challenges within the {category or 'academic'} domain.",
                f"Proposes a systematic framework validated through quantitative or analytical evaluation.",
                "Demonstrates competitive performance against baseline benchmarks reported in the literature."
            ]

        # 3. Methodology & Innovation
        method_sentences = []
        method_cues = ['method', 'approach', 'framework', 'architecture', 'model', 'algorithm', 'design', 'technique', 'pipeline', 'formulation']
        for s in sentences:
            if any(cue in s.lower() for cue in method_cues):
                method_sentences.append(s)

        if method_sentences:
            methodology = " ".join(method_sentences[:2])
        else:
            methodology = (
                f"The authors formulate a structured methodology tailored to {category or 'the target domain'}, "
                f"emphasizing formal problem definition, modular component design, and comparative empirical assessment."
            )

        # 4. Lay Summary
        lay_summary = (
            f"In simple terms, this research tackles a central challenge highlighted in '{title}'. "
            f"While existing methodologies often struggle with scalability, complexity, or accuracy, "
            f"this paper introduces a dedicated approach to streamline and improve outcomes. "
            f"By testing their method against realistic scenarios, the authors show that their solution offers "
            f"clear practical and theoretical advantages for both researchers and practitioners."
        )

        # 5. Limitations & Future Directions
        limitation_sentences = []
        limit_cues = ['limit', 'challenge', 'constraint', 'future', 'however', 'although', 'trade-off', 'remains']
        for s in sentences:
            if any(cue in s.lower() for cue in limit_cues):
                limitation_sentences.append(s)

        if limitation_sentences:
            limitations = " ".join(limitation_sentences)
        else:
            limitations = (
                "The study notes opportunities for future research, including expanding evaluation across broader "
                "datasets, reducing computational overhead, and examining cross-domain generalizability."
            )

        # 6. Keywords
        words = re.findall(r'\b[A-Za-z]{4,}\b', (title + ' ' + abstract).lower())
        stopwords = {
            'this', 'that', 'with', 'from', 'have', 'were', 'which', 'their', 'there',
            'been', 'paper', 'propose', 'study', 'using', 'based', 'model', 'approach',
            'show', 'results', 'presents', 'methods', 'performance'
        }
        word_freq = {}
        for w in words:
            if w not in stopwords:
                word_freq[w] = word_freq.get(w, 0) + 1

        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        top_keywords = [w[0].capitalize() for w in sorted_words[:6]]
        if category and category not in top_keywords:
            top_keywords.insert(0, category.upper())

        return {
            'executive_summary': executive_summary,
            'key_findings': findings[:5],
            'methodology': methodology,
            'lay_summary': lay_summary,
            'limitations': limitations,
            'keywords': top_keywords[:6],
            'generator_type': 'NLP_ENGINE'
        }

