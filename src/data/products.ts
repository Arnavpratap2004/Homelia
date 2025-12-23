// Product Data Models and Mock Data for Homelia

export interface Product {
    id: string;
    name: string;
    sku: string;
    brand: 'durian' | 'rockstar';
    category: 'decorative' | 'compact' | 'exterior' | 'fire-retardant' | 'anti-bacterial';
    finish: 'matte' | 'glossy' | 'suede' | 'textured' | 'high-gloss' | 'silk';
    texture: string;
    thickness: string;
    sheetSize: string;
    applications: string[];
    price: number | null; // null means "Price on Request"
    moq: number; // Minimum Order Quantity
    hsnCode: string;
    description: string;
    technicalSpecs: Record<string, string>;
    images: string[];
    colors: string[];
    inStock: boolean;
    featured: boolean;
    bestseller: boolean;
    emotionTags?: string[];
    usageHints?: string[];
}

export interface Category {
    id: string;
    name: string;
    description: string;
    icon: string;
    count: number;
}

export interface Brand {
    id: 'durian' | 'rockstar';
    name: string;
    logo: string;
    tagline: string;
    description: string;
    collections: string[];
    catalogPdf: string;
    color: string;
}

// Brands Data
export const brands: Brand[] = [
    {
        id: 'durian',
        name: 'Durian Laminates',
        logo: '/images/durian-logo.svg',
        tagline: 'Crafting Perfection Since 1981',
        description: 'Durian is one of India\'s most trusted names in laminates, known for exceptional quality, innovative designs, and sustainability. With over 40 years of experience, Durian offers a wide range of decorative and specialty laminates for residential and commercial applications.',
        collections: ['Woodgrains', 'Abstracts', 'Solids', 'High Gloss', 'Exterior Grade', 'Compact'],
        catalogPdf: '/catalogues/durian-catalogue.pdf',
        color: '#2563EB'
    },
    {
        id: 'rockstar',
        name: 'Rockstar Laminates',
        logo: '/images/rockstar-logo.svg',
        tagline: 'Bold Designs, Premium Quality',
        description: 'Rockstar Laminates brings contemporary designs with rock-solid durability. Known for trendy patterns and superior finish quality, Rockstar is the choice for modern interiors seeking style and substance.',
        collections: ['Urban Collection', 'Nature Series', 'Metallics', 'Stone Finish', 'Fabric Textures'],
        catalogPdf: '/catalogues/rockstar-catalogue.pdf',
        color: '#DC2626'
    }
];

// Categories Data
export const categories: Category[] = [
    { id: 'decorative', name: 'Decorative Laminates', description: 'Premium decorative surfaces for furniture and interiors', icon: 'palette', count: 245 },
    { id: 'compact', name: 'Compact Laminates', description: 'High-density structural panels for demanding applications', icon: 'layers', count: 68 },
    { id: 'exterior', name: 'Exterior Laminates', description: 'Weather-resistant laminates for outdoor use', icon: 'sun', count: 42 },
    { id: 'fire-retardant', name: 'Fire Retardant', description: 'Safety-compliant fire-resistant laminates', icon: 'flame', count: 35 },
    { id: 'anti-bacterial', name: 'Anti-Bacterial', description: 'Hygienic surfaces for healthcare and kitchens', icon: 'shield', count: 28 }
];

// Filter Options
export const finishOptions = [
    { value: 'matte', label: 'Matte' },
    { value: 'glossy', label: 'Glossy' },
    { value: 'suede', label: 'Suede' },
    { value: 'textured', label: 'Textured' },
    { value: 'high-gloss', label: 'High Gloss' },
    { value: 'silk', label: 'Silk' }
];

export const thicknessOptions = [
    { value: '0.8mm', label: '0.8 mm' },
    { value: '1mm', label: '1.0 mm' },
    { value: '1.25mm', label: '1.25 mm' },
    { value: '1.5mm', label: '1.5 mm' },
    { value: '6mm', label: '6 mm (Compact)' },
    { value: '12mm', label: '12 mm (Compact)' }
];

export const sheetSizeOptions = [
    { value: '8x4', label: '8 x 4 ft' },
    { value: '10x4', label: '10 x 4 ft' },
    { value: '12x4', label: '12 x 4 ft' }
];

export const applicationOptions = [
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'wardrobe', label: 'Wardrobe' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'office', label: 'Office' },
    { value: 'wall-panels', label: 'Wall Panels' },
    { value: 'doors', label: 'Doors' },
    { value: 'exterior', label: 'Exterior' }
];

// Generate placeholder colors for product swatches
const productColors = [
    '#8B4513', '#A0522D', '#D2691E', '#CD853F', '#DEB887',
    '#F5DEB3', '#FAEBD7', '#2F4F4F', '#696969', '#808080',
    '#A9A9A9', '#C0C0C0', '#DCDCDC', '#F5F5F5', '#FFF8DC',
    '#1E3A5F', '#2C5282', '#4A7C59', '#718096', '#9F7AEA'
];

// Mock Products Data
export const products: Product[] = [
    // Durian Products
    {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'American Walnut Classic',
        sku: 'DUR-WG-001',
        brand: 'durian',
        category: 'decorative',
        finish: 'matte',
        texture: 'Woodgrain',
        thickness: '1mm',
        sheetSize: '8x4',
        applications: ['wardrobe', 'furniture', 'office'],
        price: 2450,
        moq: 10,
        hsnCode: '4823',
        description: 'Premium American Walnut pattern with rich, warm tones. Perfect for creating elegant furniture and wardrobes with a classic wood aesthetic.',
        technicalSpecs: {
            'Surface Finish': 'Matte Texture',
            'Core Material': 'Phenolic Impregnated',
            'Abrasion Resistance': '350 rev (Minimum)',
            'Scratch Resistance': '2N (Minimum)',
            'Impact Resistance': '20N (Minimum)',
            'Light Fastness': 'Blue Scale 6'
        },
        images: ['/images/products/american-walnut-1.jpg'],
        colors: ['#654321', '#8B4513', '#A0522D'],
        inStock: true,
        featured: true,
        bestseller: true,
        emotionTags: ['Classic', 'Rich', 'Warm'],
        usageHints: ['Executive Office', 'Master Bedroom']
    },
    {
        id: '11111111-1111-4111-8111-111111111112',
        name: 'Nordic Oak Natural',
        sku: 'DUR-WG-002',
        brand: 'durian',
        category: 'decorative',
        finish: 'suede',
        texture: 'Woodgrain',
        thickness: '1mm',
        sheetSize: '8x4',
        applications: ['kitchen', 'wardrobe', 'furniture'],
        price: 2680,
        moq: 10,
        hsnCode: '4823',
        description: 'Light Nordic Oak finish with subtle grain patterns. Ideal for Scandinavian-inspired interiors and modern minimalist designs.',
        technicalSpecs: {
            'Surface Finish': 'Suede Touch',
            'Core Material': 'Phenolic Impregnated',
            'Abrasion Resistance': '350 rev (Minimum)',
            'Scratch Resistance': '2N (Minimum)',
            'Impact Resistance': '20N (Minimum)',
            'Light Fastness': 'Blue Scale 6'
        },
        images: ['/images/products/nordic-oak-1.jpg'],
        colors: ['#DEB887', '#F5DEB3', '#FAEBD7'],
        inStock: true,
        featured: true,
        bestseller: false,
        emotionTags: ['Minimalist', 'Airy', 'Scandi'],
        usageHints: ['Modern Kitchen', 'Kids Room']
    },
    {
        id: '11111111-1111-4111-8111-111111111113',
        name: 'Charcoal Slate',
        sku: 'DUR-ST-001',
        brand: 'durian',
        category: 'decorative',
        finish: 'textured',
        texture: 'Stone',
        thickness: '1mm',
        sheetSize: '8x4',
        applications: ['wall-panels', 'office', 'furniture'],
        price: 2890,
        moq: 10,
        hsnCode: '4823',
        description: 'Deep charcoal slate texture with authentic stone-like finish. Perfect for accent walls and contemporary office spaces.',
        technicalSpecs: {
            'Surface Finish': 'Deep Embossed',
            'Core Material': 'Phenolic Impregnated',
            'Abrasion Resistance': '400 rev (Minimum)',
            'Scratch Resistance': '2.5N (Minimum)',
            'Impact Resistance': '25N (Minimum)',
            'Light Fastness': 'Blue Scale 7'
        },
        images: ['/images/products/charcoal-slate-1.jpg'],
        colors: ['#2F4F4F', '#696969', '#808080'],
        inStock: true,
        featured: false,
        bestseller: true,
        emotionTags: ['Bold', 'Industrial', 'Moody'],
        usageHints: ['Accent Wall', 'Home Office']
    },
    {
        id: '11111111-1111-4111-8111-111111111114',
        name: 'Pure White Gloss',
        sku: 'DUR-HG-001',
        brand: 'durian',
        category: 'decorative',
        finish: 'high-gloss',
        texture: 'Solid',
        thickness: '1mm',
        sheetSize: '8x4',
        applications: ['kitchen', 'wardrobe', 'furniture'],
        price: 3200,
        moq: 10,
        hsnCode: '4823',
        description: 'Ultra-reflective pure white high gloss laminate. Creates stunning modern kitchens and premium wardrobe finishes.',
        technicalSpecs: {
            'Surface Finish': 'Mirror Gloss',
            'Core Material': 'Phenolic Impregnated',
            'Abrasion Resistance': '300 rev (Minimum)',
            'Scratch Resistance': '2N (Minimum)',
            'Gloss Level': '85+ GU',
            'Light Fastness': 'Blue Scale 7'
        },
        images: ['/images/products/pure-white-gloss-1.jpg'],
        colors: ['#FFFFFF', '#F5F5F5', '#FAFAFA'],
        inStock: true,
        featured: true,
        bestseller: true,
        emotionTags: ['Pristine', 'Modern', 'Sleek'],
        usageHints: ['Luxury Kitchen', 'Wardrobe']
    },
    {
        id: '11111111-1111-4111-8111-111111111115',
        name: 'Exterior Teak',
        sku: 'DUR-EX-001',
        brand: 'durian',
        category: 'exterior',
        finish: 'textured',
        texture: 'Woodgrain',
        thickness: '1.5mm',
        sheetSize: '8x4',
        applications: ['exterior', 'wall-panels'],
        price: null,
        moq: 25,
        hsnCode: '4823',
        description: 'Weather-resistant exterior grade laminate with teak wood finish. UV resistant and ideal for outdoor cladding applications.',
        technicalSpecs: {
            'Surface Finish': 'Anti-UV Coating',
            'Core Material': 'Phenolic Impregnated',
            'Weather Resistance': '5000 hrs QUV',
            'Water Absorption': '<6%',
            'UV Resistance': 'Excellent',
            'Temperature Resistance': '-20°C to 80°C'
        },
        images: ['/images/products/exterior-teak-1.jpg'],
        colors: ['#8B4513', '#A0522D', '#CD853F'],
        inStock: true,
        featured: false,
        bestseller: false,
        emotionTags: ['Durable', 'Natural', 'Protective'],
        usageHints: ['Gate Cladding', 'Balcony']
    },
    {
        id: '11111111-1111-4111-8111-111111111116',
        name: 'Compact White Core',
        sku: 'DUR-CP-001',
        brand: 'durian',
        category: 'compact',
        finish: 'matte',
        texture: 'Solid',
        thickness: '6mm',
        sheetSize: '8x4',
        applications: ['wall-panels', 'furniture', 'office'],
        price: null,
        moq: 20,
        hsnCode: '4823',
        description: 'High-density compact laminate panel with solid white core. Self-supporting structural panel for partitions and furniture.',
        technicalSpecs: {
            'Density': '>1350 kg/m³',
            'Flexural Strength': '>80 N/mm²',
            'Impact Resistance': '>30N',
            'Water Absorption': '<4%',
            'Fire Rating': 'Class B-s1, d0',
            'Core Type': 'White Core'
        },
        images: ['/images/products/compact-white-1.jpg'],
        colors: ['#FFFFFF', '#F0F0F0'],
        inStock: true,
        featured: false,
        bestseller: false,
        emotionTags: ['Solid', 'Clean', 'Structural'],
        usageHints: ['Toilet Partitions', 'Lab Tables']
    },
    // Rockstar Products
    {
        id: '22222222-2222-4222-8222-222222222221',
        name: 'Urban Concrete Grey',
        sku: 'ROC-UC-001',
        brand: 'rockstar',
        category: 'decorative',
        finish: 'textured',
        texture: 'Concrete',
        thickness: '1mm',
        sheetSize: '8x4',
        applications: ['wall-panels', 'office', 'furniture'],
        price: 2550,
        moq: 10,
        hsnCode: '4823',
        description: 'Industrial-chic concrete texture with subtle variations. Perfect for loft-style interiors and modern office spaces.',
        technicalSpecs: {
            'Surface Finish': 'Deep Texture',
            'Core Material': 'Phenolic Impregnated',
            'Abrasion Resistance': '400 rev (Minimum)',
            'Scratch Resistance': '2.5N (Minimum)',
            'Impact Resistance': '25N (Minimum)',
            'Light Fastness': 'Blue Scale 7'
        },
        images: ['/images/products/urban-concrete-1.jpg'],
        colors: ['#808080', '#A9A9A9', '#696969'],
        inStock: true,
        featured: true,
        bestseller: true,
        emotionTags: ['Urban', 'Raw', 'Contemporary'],
        usageHints: ['Reception', 'Living Room']
    },
    {
        id: '22222222-2222-4222-8222-222222222222',
        name: 'Midnight Black Silk',
        sku: 'ROC-SL-001',
        brand: 'rockstar',
        category: 'decorative',
        finish: 'silk',
        texture: 'Solid',
        thickness: '1mm',
        sheetSize: '8x4',
        applications: ['kitchen', 'wardrobe', 'furniture'],
        price: 2780,
        moq: 10,
        hsnCode: '4823',
        description: 'Deep black laminate with silky smooth finish. Anti-fingerprint surface for luxurious modern kitchens and wardrobes.',
        technicalSpecs: {
            'Surface Finish': 'Silk Soft Touch',
            'Core Material': 'Phenolic Impregnated',
            'Abrasion Resistance': '350 rev (Minimum)',
            'Anti-Fingerprint': 'Yes',
            'Gloss Level': '5-10 GU',
            'Light Fastness': 'Blue Scale 7'
        },
        images: ['/images/products/midnight-black-1.jpg'],
        colors: ['#1A1A1A', '#2D2D2D', '#3D3D3D'],
        inStock: true,
        featured: true,
        bestseller: false,
        emotionTags: ['Luxurious', 'Velvet', 'Midnight'],
        usageHints: ['Master Suite', 'Bar Counter']
    },
    {
        id: '22222222-2222-4222-8222-222222222223',
        name: 'Bronze Metallic',
        sku: 'ROC-MT-001',
        brand: 'rockstar',
        category: 'decorative',
        finish: 'glossy',
        texture: 'Metallic',
        thickness: '1mm',
        sheetSize: '8x4',
        applications: ['wall-panels', 'furniture', 'doors'],
        price: 3100,
        moq: 10,
        hsnCode: '4823',
        description: 'Stunning bronze metallic finish with subtle shimmer. Creates dramatic accent surfaces for luxury interiors.',
        technicalSpecs: {
            'Surface Finish': 'Metallic Gloss',
            'Core Material': 'Phenolic Impregnated',
            'Abrasion Resistance': '300 rev (Minimum)',
            'Scratch Resistance': '2N (Minimum)',
            'Gloss Level': '60-70 GU',
            'Light Fastness': 'Blue Scale 6'
        },
        images: ['/images/products/bronze-metallic-1.jpg'],
        colors: ['#CD7F32', '#B8860B', '#DAA520'],
        inStock: true,
        featured: false,
        bestseller: true,
        emotionTags: ['Opulent', 'Shimmer', 'Statement'],
        usageHints: ['Feature Wall', 'Hotel Lobby']
    },
    {
        id: '22222222-2222-4222-8222-222222222224',
        name: 'Tropical Teak',
        sku: 'ROC-WG-001',
        brand: 'rockstar',
        category: 'decorative',
        finish: 'matte',
        texture: 'Woodgrain',
        thickness: '1mm',
        sheetSize: '8x4',
        applications: ['wardrobe', 'furniture', 'office'],
        price: 2390,
        moq: 10,
        hsnCode: '4823',
        description: 'Rich tropical teak woodgrain with warm golden undertones. Classic choice for traditional and contemporary furniture.',
        technicalSpecs: {
            'Surface Finish': 'Matte Natural',
            'Core Material': 'Phenolic Impregnated',
            'Abrasion Resistance': '350 rev (Minimum)',
            'Scratch Resistance': '2N (Minimum)',
            'Impact Resistance': '20N (Minimum)',
            'Light Fastness': 'Blue Scale 6'
        },
        images: ['/images/products/tropical-teak-1.jpg'],
        colors: ['#D2691E', '#CD853F', '#DEB887'],
        inStock: true,
        featured: false,
        bestseller: false,
        emotionTags: ['Vibrant', 'Tropical', 'Warm'],
        usageHints: ['Resort Villa', 'Study Table']
    },
    {
        id: '22222222-2222-4222-8222-222222222225',
        name: 'Linen Fabric',
        sku: 'ROC-FB-001',
        brand: 'rockstar',
        category: 'decorative',
        finish: 'textured',
        texture: 'Fabric',
        thickness: '1mm',
        sheetSize: '8x4',
        applications: ['wall-panels', 'furniture', 'wardrobe'],
        price: 2650,
        moq: 10,
        hsnCode: '4823',
        description: 'Elegant linen fabric texture in neutral beige. Adds warmth and sophistication to any interior space.',
        technicalSpecs: {
            'Surface Finish': 'Fabric Embossed',
            'Core Material': 'Phenolic Impregnated',
            'Abrasion Resistance': '350 rev (Minimum)',
            'Scratch Resistance': '2N (Minimum)',
            'Impact Resistance': '20N (Minimum)',
            'Light Fastness': 'Blue Scale 6'
        },
        images: ['/images/products/linen-fabric-1.jpg'],
        colors: ['#F5F5DC', '#E8E4C9', '#D2C8B0'],
        inStock: true,
        featured: true,
        bestseller: false,
        emotionTags: ['Soft', 'Organic', 'Calm'],
        usageHints: ['Bedroom', 'Reading Nook']
    },
    {
        id: '22222222-2222-4222-8222-222222222226',
        name: 'Fire Shield FR',
        sku: 'ROC-FR-001',
        brand: 'rockstar',
        category: 'fire-retardant',
        finish: 'matte',
        texture: 'Solid',
        thickness: '1.25mm',
        sheetSize: '8x4',
        applications: ['office', 'wall-panels'],
        price: null,
        moq: 20,
        hsnCode: '4823',
        description: 'Fire-retardant laminate meeting Class 1 fire rating. Essential for commercial spaces and public buildings.',
        technicalSpecs: {
            'Fire Rating': 'Class 1 (BS 476 Part 7)',
            'Core Material': 'FR Phenolic Impregnated',
            'Smoke Density': 'Low Smoke',
            'Toxicity': 'Low Toxic',
            'Abrasion Resistance': '350 rev (Minimum)',
            'Light Fastness': 'Blue Scale 6'
        },
        images: ['/images/products/fire-shield-1.jpg'],
        colors: ['#E0E0E0', '#D0D0D0', '#C0C0C0'],
        inStock: true,
        featured: false,
        bestseller: false,
        emotionTags: ['Safe', 'Certified', 'Reliable'],
        usageHints: ['Fire Exit', 'Server Room']
    }
];

// Helper functions
export const getProductById = (id: string): Product | undefined => {
    return products.find(p => p.id === id);
};

export const getProductsByBrand = (brand: 'durian' | 'rockstar'): Product[] => {
    return products.filter(p => p.brand === brand);
};

export const getProductsByCategory = (category: string): Product[] => {
    return products.filter(p => p.category === category);
};

export const getFeaturedProducts = (): Product[] => {
    return products.filter(p => p.featured);
};

export const getBestsellerProducts = (): Product[] => {
    return products.filter(p => p.bestseller);
};

export const getBrandById = (id: 'durian' | 'rockstar'): Brand | undefined => {
    return brands.find(b => b.id === id);
};

export const formatPrice = (price: number | null): string => {
    if (price === null) return 'Price on Request';
    return `₹${price.toLocaleString('en-IN')}`;
};

export const formatPricePerSheet = (price: number | null): string => {
    if (price === null) return 'Price on Request';
    return `₹${price.toLocaleString('en-IN')}/sheet`;
};
