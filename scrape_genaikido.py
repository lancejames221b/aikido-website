#!/usr/bin/env python3
"""
Genaikido.com Website Scraper
Author: Lance James, Unit 221B
Description: Scrapes and clones the genaikido.com website for mockup purposes
"""

import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
import json

class GenaikidoScraper:
    def __init__(self, base_url="https://genaikido.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        self.scraped_data = {}
        self.assets_dir = "assets"
        self.pages_dir = "pages"
        
    def setup_directories(self):
        """Create necessary directories for the scraped content"""
        os.makedirs(self.assets_dir, exist_ok=True)
        os.makedirs(self.pages_dir, exist_ok=True)
        os.makedirs(f"{self.assets_dir}/images", exist_ok=True)
        os.makedirs(f"{self.assets_dir}/css", exist_ok=True)
        os.makedirs(f"{self.assets_dir}/js", exist_ok=True)
        
    def fetch_page(self, url):
        """Fetch a single page with error handling"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return response
        except requests.RequestException as e:
            print(f"Error fetching {url}: {e}")
            return None
            
    def save_asset(self, asset_url, asset_type="images"):
        """Download and save assets like images, CSS, JS"""
        try:
            response = self.fetch_page(asset_url)
            if not response:
                return None
                
            filename = os.path.basename(urlparse(asset_url).path)
            if not filename:
                filename = f"asset_{hash(asset_url) % 10000}"
                
            filepath = os.path.join(self.assets_dir, asset_type, filename)
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
                
            return f"./{asset_type}/{filename}"
        except Exception as e:
            print(f"Error saving asset {asset_url}: {e}")
            return None
            
    def scrape_page(self, url, page_name):
        """Scrape a single page and extract content"""
        print(f"Scraping: {url}")
        response = self.fetch_page(url)
        
        if not response:
            return None
            
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract page data
        page_data = {
            'url': url,
            'title': soup.title.string if soup.title else '',
            'content': {},
            'assets': []
        }
        
        # Extract main content areas
        main_content = soup.find('main') or soup.find('body')
        if main_content:
            page_data['content']['main'] = main_content.get_text(strip=True)
            
        # Extract navigation
        nav = soup.find('nav') or soup.find('header')
        if nav:
            page_data['content']['navigation'] = [link.get_text(strip=True) for link in nav.find_all('a')]
            
        # Find and download images
        for img in soup.find_all('img'):
            src = img.get('src')
            if src:
                img_url = urljoin(url, src)
                local_path = self.save_asset(img_url, "images")
                if local_path:
                    page_data['assets'].append({
                        'type': 'image',
                        'original_url': img_url,
                        'local_path': local_path,
                        'alt': img.get('alt', '')
                    })
                    
        # Save page HTML with local asset references
        self.save_page_html(soup, page_name, page_data['assets'])
        
        return page_data
        
    def save_page_html(self, soup, page_name, assets):
        """Save the HTML page with updated asset references"""
        # Update image sources to local paths
        for asset in assets:
            if asset['type'] == 'image':
                for img in soup.find_all('img', src=True):
                    if asset['original_url'] in img['src']:
                        img['src'] = asset['local_path']
                        
        # Save the modified HTML
        html_path = os.path.join(self.pages_dir, f"{page_name}.html")
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(str(soup))
            
    def get_navigation_links(self):
        """Extract navigation links from the main page"""
        response = self.fetch_page(self.base_url)
        if not response:
            return []
            
        soup = BeautifulSoup(response.content, 'html.parser')
        links = []
        
        # Find navigation links
        for nav in soup.find_all(['nav', 'header']):
            for link in nav.find_all('a', href=True):
                href = link['href']
                if href.startswith('/') or self.base_url in href:
                    full_url = urljoin(self.base_url, href)
                    links.append({
                        'url': full_url,
                        'text': link.get_text(strip=True),
                        'page_name': link.get_text(strip=True).lower().replace(' ', '_')
                    })
                    
        # Add main page
        links.insert(0, {
            'url': self.base_url,
            'text': 'Home',
            'page_name': 'home'
        })
        
        return links
        
    def scrape_all(self):
        """Main scraping function"""
        print("Starting Genaikido.com scrape...")
        self.setup_directories()
        
        # Get all navigation links
        nav_links = self.get_navigation_links()
        
        for link in nav_links:
            page_data = self.scrape_page(link['url'], link['page_name'])
            if page_data:
                self.scraped_data[link['page_name']] = page_data
            time.sleep(1)  # Be respectful with requests
            
        # Save metadata
        with open('scraped_data.json', 'w') as f:
            json.dump(self.scraped_data, f, indent=2)
            
        print(f"Scraping complete! Data saved for {len(self.scraped_data)} pages.")
        
        # Create index file
        self.create_index()
        
    def create_index(self):
        """Create an index.html file linking to all scraped pages"""
        index_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Genaikido.com Clone - Index</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; }
        .page-list { margin-top: 30px; }
        .page-link { display: block; margin: 10px 0; padding: 10px; background: #f5f5f5; text-decoration: none; color: #333; }
        .page-link:hover { background: #e5e5e5; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Genaikido.com Clone</h1>
        <p>Author: Lance James, Unit 221B</p>
        <p>Scraped on: """ + time.strftime("%Y-%m-%d %H:%M:%S") + """</p>
    </div>
    
    <div class="page-list">
        <h2>Available Pages:</h2>
"""
        
        for page_name in self.scraped_data.keys():
            index_html += f'        <a href="pages/{page_name}.html" class="page-link">{page_name.replace("_", " ").title()}</a>\n'
            
        index_html += """    </div>
</body>
</html>"""
        
        with open('index.html', 'w') as f:
            f.write(index_html)

if __name__ == "__main__":
    scraper = GenaikidoScraper()
    scraper.scrape_all()