from flask import Flask, render_template, url_for, request, jsonify
from pint import UnitRegistry, UndefinedUnitError, DimensionalityError
import datetime
import requests # Import the requests library for API calls

app = Flask(__name__)

ureg = UnitRegistry()
# Define custom units that are not in the default registry
ureg.define('ton_of_refrigeration = 12000 * BTU / hour')
Q_ = ureg.Quantity

# ExchangeRate-API Key
EXCHANGE_RATE_API_KEY = 'e46ee561af20ed600486a37f'
EXCHANGE_RATE_API_BASE_URL = f'https://v6.exchangerate-api.com/v6/{EXCHANGE_RATE_API_KEY}/latest/'

# Mapping for currency display names/URL parts to API-compatible codes
# This map helps normalize currency inputs (e.g., 'yen' from URL to 'JPY' for API)
CURRENCY_CODE_MAP = {
    'usd': 'USD',
    'pkr': 'PKR',
    'euro': 'EUR', # URL part 'euro' maps to API code 'EUR'
    'eur': 'EUR', # Ensure EUR also maps
    'gbp': 'GBP',
    'yen': 'JPY', # URL part 'yen' maps to API code 'JPY'
    'jpy': 'JPY', # Ensure JPY also maps
}


# Frontend Routes
# Home Page (previously index.html)
@app.route('/')
def home():
    return render_template('home/index.html')

# Base Route for each converter category (e.g., /length/, /temperature/)
# These will serve the 'index.html' file inside each category folder.
@app.route('/length/')
def length_converter_index():
    return render_template('length/index.html')

@app.route('/temperature/')
def temperature_converter_index():
    return render_template('temperature/index.html')

@app.route('/area/')
def area_converter_index():
    return render_template('area/index.html')

@app.route('/volume/')
def volume_converter_index():
    return render_template('volume/index.html')

@app.route('/weight/')
def weight_converter_index():
    return render_template('weight/index.html')

@app.route('/time/')
def time_converter_index():
    return render_template('time/index.html')

@app.route('/age/') # Age converter is a single page but moved to its folder
def age_converter_index():
    return render_template('age/index.html')

@app.route('/currency/') # Currency converter is a single page but moved to its folder
def currency_converter_page_index():
    return render_template('currency/index.html')

@app.route('/speed/')
def speed_converter_index():
    return render_template('speed/index.html')

@app.route('/digital_storage/')
def digital_storage_converter_index():
    return render_template('digital_storage/index.html')

@app.route('/energy/')
def energy_converter_index():
    return render_template('energy/index.html')

@app.route('/frequency/')
def frequency_converter_index():
    return render_template('frequency/index.html')

@app.route('/pressure/')
def pressure_converter_index():
    return render_template('pressure/index.html')

@app.route('/force/')
def force_converter_index():
    return render_template('force/index.html')

@app.route('/power/')
def power_converter_index():
    return render_template('power/index.html')

@app.route('/angle/')
def angle_converter_index():
    return render_template('angle/index.html')

@app.route('/density/')
def density_converter_index():
    return render_template('density/index.html')

# Dynamic Routes for Specific Unit Conversions (e.g., /length/meter_to_feet.html)
# The `converter_type` parameter in the `convert` API will be used to map to the correct category.

@app.route('/length/<from_unit>_to_<to_unit>.html')
def length_specific_conversion(from_unit, to_unit):
    # Pass display names to the template for better readability in headings/labels
    return render_template(f'length/{from_unit}_to_{to_unit}.html', 
                           display_from=from_unit.replace('_', ' ').title(), 
                           display_to=to_unit.replace('_', ' ').title())

@app.route('/temperature/<from_unit>_to_<to_unit>.html')
def temperature_specific_conversion(from_unit, to_unit):
    return render_template(f'temperature/{from_unit}_to_{to_unit}.html', 
                           display_from=from_unit.replace('_', ' ').title(), 
                           display_to=to_unit.replace('_', ' ').title())

@app.route('/area/<from_unit>_to_<to_unit>.html')
def area_specific_conversion(from_unit, to_unit):
    return render_template(f'area/{from_unit}_to_{to_unit}.html', 
                           display_from=from_unit.replace('_', ' ').title(), 
                           display_to=to_unit.replace('_', ' ').title())

@app.route('/volume/<from_unit>_to_<to_unit>.html')
def volume_specific_conversion(from_unit, to_unit):
    return render_template(f'volume/{from_unit}_to_{to_unit}.html', 
                           display_from=from_unit.replace('_', ' ').title(), 
                           display_to=to_unit.replace('_', ' ').title())

@app.route('/weight/<from_unit>_to_<to_unit>.html')
def weight_specific_conversion(from_unit, to_unit):
    # This route is already defined, just re-iterating for context
    return render_template(f'weight/{from_unit}_to_{to_unit}.html', 
                           display_from=from_unit.replace('_', ' ').title(), 
                           display_to=to_unit.replace('_', ' ').title())

@app.route('/time/<from_unit>_to_<to_unit>.html')
def time_specific_conversion(from_unit, to_unit):
    return render_template(f'time/{from_unit}_to_{to_unit}.html', 
                           display_from=from_unit.replace('_', ' ').title(), 
                           display_to=to_unit.replace('_', ' ').title())

@app.route('/speed/<from_unit>_to_<to_unit>.html')
def speed_specific_conversion(from_unit, to_unit):
    return render_template(f'speed/{from_unit}_to_{to_unit}.html', 
                           display_from=from_unit.replace('_', ' ').title(), 
                           display_to=to_unit.replace('_', ' ').title())

@app.route('/digital_storage/<from_unit>_to_<to_unit>.html')
def digital_storage_specific_conversion(from_unit, to_unit):
    return render_template(f'digital_storage/{from_unit}_to_{to_unit}.html', 
                           display_from=from_unit.replace('_', ' ').upper(), 
                           display_to=to_unit.replace('_', ' ').upper())

@app.route('/energy/<from_unit>_to_<to_unit>.html')
def energy_specific_conversion(from_unit, to_unit):
    return render_template(f'energy/{from_unit}_to_{to_unit}.html', 
                           display_from=from_unit.replace('_', ' ').title(), 
                           display_to=to_unit.replace('_', ' ').title())

@app.route('/frequency/<from_unit>_to_<to_unit>.html')
def frequency_specific_conversion(from_unit, to_unit):
    return render_template(f'frequency/{from_unit}_to_{to_unit}.html', 
                           display_from=from_unit.replace('_', ' ').title(), 
                           display_to=to_unit.replace('_', ' ').title())

@app.route('/pressure/<from_unit>_to_<to_unit>.html')
def pressure_specific_conversion(from_unit, to_unit):
    return render_template(f'pressure/{from_unit}_to_{to_unit}.html', 
                           display_from=from_unit.replace('_', ' ').upper(), 
                           display_to=to_unit.replace('_', ' ').upper())

@app.route('/force/<from_unit>_to_<to_unit>.html')
def force_specific_conversion(from_unit, to_unit):
    return render_template(f'force/{from_unit}_to_{to_unit}.html', 
                           display_from=from_unit.replace('_', ' ').title(), 
                           display_to=to_unit.replace('_', ' ').title())

@app.route('/power/<from_unit>_to_<to_unit>.html')
def power_specific_conversion(from_unit, to_unit):
    return render_template(f'power/{from_unit}_to_{to_unit}.html', 
                           display_from=from_unit.replace('_', ' ').title(), 
                           display_to=to_unit.replace('_', ' ').title())

@app.route('/angle/<from_unit>_to_<to_unit>.html')
def angle_specific_conversion(from_unit, to_unit):
    return render_template(f'angle/{from_unit}_to_{to_unit}.html', 
                           display_from=from_unit.replace('_', ' ').title(), 
                           display_to=to_unit.replace('_', ' ').title())

@app.route('/density/<from_unit>_to_<to_unit>.html')
def density_specific_conversion(from_unit, to_unit):
    return render_template(f'density/{from_unit}_to_{to_unit}.html', 
                           display_from=from_unit.replace('_', ' ').title(), 
                           display_to=to_unit.replace('_', ' ').title())

@app.route('/currency/<from_unit>_to_<to_unit>.html') # Add this route for specific currency conversions
def currency_specific_conversion(from_unit, to_unit):
    # Ensure correct display for currency codes on specific pages
    display_from_code = CURRENCY_CODE_MAP.get(from_unit.lower(), from_unit).upper()
    display_to_code = CURRENCY_CODE_MAP.get(to_unit.lower(), to_unit).upper()
    
    return render_template(f'currency/{from_unit}_to_{to_unit}.html', 
                           display_from=display_from_code, 
                           display_to=display_to_code)

# Blog Routes
@app.route('/blogs/')
def blogs_index():
    # Yahan hum future mein blog posts ka data pass kar sakte hain
    return render_template('blogs/index.html')

@app.route('/blogs/<string:slug>.html')
def blog_post(slug):
    # Yahan hum slug ke mutabiq blog post ka content load karenge
    # Filhaal, hum dynamic template loading use kar rahe hain
    try:
        return render_template(f'blogs/{slug}.html')
    except Exception as e:
        app.logger.error(f"Blog post not found or error loading blog: {slug}.html - {e}")
        return render_template('404.html'), 404 # Agar blog post na mile to 404 page dikhao


# Backend API for Unit Conversions
@app.route('/convert', methods=['POST'])
def convert_unit():
    data = request.json
    value = data.get('value')
    from_unit_str = data.get('from_unit')
    to_unit_str = data.get('to_unit')
    converter_type = data.get('converter_type')

    if value is None or not isinstance(value, (int, float)) or from_unit_str is None or to_unit_str is None:
        return jsonify({'result': 'Invalid input data. Please provide value, from_unit, and to_unit.', 'status': 'error'}), 400

    if not from_unit_str.strip() or not to_unit_str.strip():
        return jsonify({'result': 'Please select both "From" and "To" units.'}), 400

    # Handle currency conversion separately
    if converter_type == 'currency':
        try:
            # Normalize currency codes for API using the map
            normalized_from_unit = CURRENCY_CODE_MAP.get(from_unit_str.lower(), from_unit_str.upper())
            normalized_to_unit = CURRENCY_CODE_MAP.get(to_unit_str.lower(), to_unit_str.upper())
            
            # Fallback to uppercase if normalization doesn't yield a known code (e.g., for new, unmapped currencies)
            # This handles cases where user directly types a valid code not in CURRENCY_CODE_MAP, like "AUD"
            if normalized_from_unit not in CURRENCY_CODE_MAP.values() and from_unit_str.upper() not in CURRENCY_CODE_MAP.values():
                normalized_from_unit = from_unit_str.upper()
            if normalized_to_unit not in CURRENCY_CODE_MAP.values() and to_unit_str.upper() not in CURRENCY_CODE_MAP.values():
                normalized_to_unit = to_unit_str.upper()

            response = requests.get(f"{EXCHANGE_RATE_API_BASE_URL}{normalized_from_unit}")
            response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)
            exchange_rates = response.json()

            if exchange_rates and exchange_rates.get('result') == 'success':
                rates = exchange_rates.get('conversion_rates', {})
                if normalized_to_unit in rates:
                    rate = rates[normalized_to_unit]
                    converted_value = value * rate
                    return jsonify({'result': f"{converted_value:.2f}", 'status': 'success'})
                else:
                    return jsonify({'result': f"Error: To currency '{normalized_to_unit}' not found in exchange rates.", 'status': 'error'}), 400
            else:
                return jsonify({'result': f"Error fetching exchange rates: {exchange_rates.get('error-type', 'Unknown error')}", 'status': 'error'}), 500

        except requests.exceptions.RequestException as e:
            app.logger.error(f"Error fetching currency exchange rates: {e}", exc_info=True)
            return jsonify({'result': f"Error connecting to currency API or invalid currency code: {e}", 'status': 'error'}), 500
        except Exception as e:
            app.logger.error(f"An unexpected error occurred during currency conversion: {e}", exc_info=True)
            return jsonify({'result': f"An unexpected error occurred during currency conversion: {e}", 'status': 'error'}), 500

    # General unit conversion using pint
    try:
        # **MODIFICATION START**
        # Check if the converter is 'force' or 'power' and map units accordingly
        if converter_type == 'force':
            if 'kg' in from_unit_str.lower():
                from_unit_str = 'kilogram_force'
            if 'lbs' in from_unit_str.lower():
                from_unit_str = 'pound_force'
            
            if 'kg' in to_unit_str.lower():
                to_unit_str = 'kilogram_force'
            if 'lbs' in to_unit_str.lower():
                to_unit_str = 'pound_force'
        
        if converter_type == 'power':
            if from_unit_str.lower() == 'kw':
                from_unit_str = 'kilowatt'
            if from_unit_str.lower() == 'hp':
                from_unit_str = 'horsepower'
            if from_unit_str.lower() == 'btu_per_hr' or from_unit_str.lower() == 'btu per hour':
                from_unit_str = 'BTU/hour'

            if to_unit_str.lower() == 'kw':
                to_unit_str = 'kilowatt'
            if to_unit_str.lower() == 'hp':
                to_unit_str = 'horsepower'
            if to_unit_str.lower() == 'btu_per_hr' or to_unit_str.lower() == 'btu per hour':
                to_unit_str = 'BTU/hour'

        # **MODIFICATION END**

        unit_map = {
            # Length Units
            'meter': 'meter', 'kilometer': 'kilometer', 'centimeter': 'centimeter', 'millimeter': 'millimeter',
            'micrometer': 'micrometer', 'nanometer': 'nanometer', 'mile': 'mile', 'yard': 'yard',
            'foot': 'foot', 'inch': 'inch', 'light year': 'light_year', 'nautical mile': 'nautical_mile',
            # Temperature Units
            'celsius': 'degC', 'fahrenheit': 'degF', 'kelvin': 'kelvin', 'rankine': 'degR', 'réaumur': 'degRe',
            # Area Units
            'square meter': 'meter ** 2', 'square kilometer': 'kilometer ** 2', 'square centimeter': 'centimeter ** 2',
            'square millimeter': 'millimeter ** 2', 'square micrometer': 'micrometer ** 2', 'hectare': 'hectare',
            'acre': 'acre', 'square mile': 'mile ** 2', 'square yard': 'yard ** 2', 'square foot': 'foot ** 2',
            'square inch': 'inch ** 2', 'are': 'are',
            # Volume Units (Updated for Pint compatibility)
            'litre': 'liter',
            'millilitre': 'milliliter', # Pint recognizes 'milliliter' directly
            'cubic meter': 'meter ** 3',
            'cubic centimeter': 'milliliter', # 1 cc == 1 ml, Pint handles this conversion
            'cubic millimeter': 'millimeter ** 3',
            'gallon (us liquid)': 'gallon', # Pint's default 'gallon' is US liquid gallon
            'gallon (uk)': 'gallon_UK',
            'fluid ounce (us)': 'fluid_ounce', # Pint recognizes 'fluid_ounce'
            'fluid ounce (uk)': 'fluid_ounce_UK',
            'barrel (us liquid)': 'barrel_US',
            'quart (us liquid)': 'quart', # Pint recognizes 'quart'
            'pint (us liquid)': 'pint', # Pint recognizes 'pint'
            'cup (us)': 'cup', # Pint recognizes 'cup'
            'teaspoon (us)': 'teaspoon', # Pint recognizes 'teaspoon'
            'tablespoon (us)': 'tablespoon', # Pint recognizes 'tablespoon'
            'cubic inch': 'inch ** 3',
            'cubic foot': 'foot ** 3',
            # Weight Units (Updated with common aliases)
            'kilogram': 'kilogram', 'kg': 'kilogram',
            'gram': 'gram', 'g': 'gram',
            'milligram': 'milligram', 'mg': 'milligram',
            'metric ton': 'tonne',
            'long ton': 'ton_long',
            'short ton': 'ton_short', 'ton': 'ton_short', # Added 'ton' as alias for short ton
            'pound': 'pound', 'lbs': 'pound', # Added 'lbs' as alias for pound
            'ounce': 'avoirduounce', 'oz': 'avoirduounce', # CORRECTED: Mapped to avoirdupois_ounce for mass
            'carat': 'carat', 'atomic mass unit': 'atomic_mass_unit', 'stone': 'stone',
            # Time Units
            'second': 'second', 'millisecond': 'millisecond', 'microsecond': 'microsecond', 'nanosecond': 'nanosecond',
            'minute': 'minute', 'hour': 'hour', 'day': 'day', 'week': 'week', 'month (approx)': 'month',
            'year (approx)': 'year', 'decade': 'decade', 'century': 'century', 'millennium': 'millennium',
            # Speed Units
            'meter per second': 'meter / second', 'kilometer per hour': 'kilometer / hour',
            'mile per hour': 'mile / hour', 'knot': 'knot', 'foot per second': 'foot / second',
            'mach': 'mach', 'speed of light': 'speed_of_light',
            # Digital Storage Units
            'bit': 'bit', 'byte': 'byte', 'kilobit': 'kilobit', 'kilobyte': 'kilobyte', 'megabit': 'megabit',
            'megabyte': 'megabyte', 'gigabit': 'gigabit', 'gigabyte': 'gigabyte', 'terabit': 'terabit',
            'terabyte': 'terabyte', 'petabyte': 'petabyte', 'exabyte': 'exabyte',
            # Energy Units
            'joule': 'joule', 'kilojoule': 'kilojoule', 'calorie': 'calorie', 'kilocalorie': 'kilocalorie',
            'kilowatt-hour': 'kW * hour', 'electron volt': 'electron_volt', 'btu': 'BTU', 'therm': 'therm',
            'foot-pound (energy)': 'foot_pound',
            # Frequency Units
            'hertz': 'hertz', 'kilohertz': 'kilohertz', 'megahertz': 'megahertz', 'gigahertz': 'gigahertz',
            # Pressure Units
            'pascal': 'pascal', 'kilopascal': 'kilopascal', 'bar': 'bar', 'psi': 'psi', 'atmosphere': 'atmosphere',
            'torr': 'torr',
            # Force Units
            'newton': 'newton', 'kilonewton': 'kilonewton', 'dyne': 'dyne', 'pound-force': 'pound_force',
            'kilogram-force': 'kilogram_force',
            # Power Units
            'watt': 'watt', 'kilowatt': 'kilowatt', 'megawatt': 'megawatt', 'horsepower': 'horsepower',
            'foot-pound per minute': 'foot_pound / minute', 'btu per hour': 'BTU/hour', 'ton of refrigeration': 'ton_of_refrigeration',
            # Angle Units
            'degree': 'degree', 'radian': 'radian', 'gradian': 'grad', 'milliradian': 'milliradian',
            'arcminute': 'arcminute', 'arcsecond': 'arcsecond',
            # Density Units
            'kilogram per cubic meter': 'kilogram / meter ** 3',
            'gram per cubic centimeter': 'gram / centimeter ** 3',
            'pound per cubic foot': 'pound / foot ** 3',
            'pound per cubic inch': 'pound / inch ** 3',
        }
        
        cleaned_from_unit_str = from_unit_str.lower().strip()
        cleaned_to_unit_str = to_unit_str.lower().strip()

        pint_unit_mapping_aliases = {
            'gallon (us liquid)': 'gallon',
            'gallon (uk)': 'gallon_UK',
            'fluid ounce (us)': 'fluid_ounce',
            'fluid ounce (uk)': 'fluid_ounce_UK',
            'barrel (us liquid)': 'barrel_US',
            'quart (us liquid)': 'quart',
            'pint (us liquid)': 'pint',
            'cup (us)': 'cup',
            'teaspoon (us)': 'teaspoon',
            'tablespoon (us)': 'tablespoon',
            'cubic centimeter': 'milliliter',
            'litre': 'liter',
            'millilitre': 'milliliter',
            'cubic meter': 'meter ** 3',
            'cubic millimeter': 'millimeter ** 3',
            'cubic inch': 'inch ** 3',
            'cubic foot': 'foot ** 3',
            'gal': 'gallon',
            'ml': 'milliliter',
            'l': 'liter',
            'cc': 'milliliter',
            'oz': 'avoirduounce',
            'fl oz': 'fluid_ounce',
            'tbsp': 'tablespoon',
            'tsp': 'teaspoon',
            'cu ft': 'foot ** 3',
            'cu in': 'inch ** 3',
            'kilo gram': 'kilogram',
            'pounds': 'pound',
            'ounces': 'avoirduounce',
            'lbs': 'pound', # This will be used for weight, force is handled above
            'ton': 'ton_short',
            'stone': 'stone',
            'sq ft': 'foot ** 2',
            'sq m': 'meter ** 2',
            'sq mi': 'mile ** 2',
            'sq yd': 'yard ** 2',
            'ha': 'hectare',
            'ac': 'acre',
            'b': 'bit',
            'B': 'byte',
            'kb': 'kilobyte',
            'mb': 'megabyte',
            'gb': 'gigabyte',
            'tb': 'terabyte',
            'pb': 'petabyte',
            'eb': 'exabyte',
            'j': 'joule',
            'kj': 'kilojoule',
            'cal': 'calorie',
            'kcal': 'kilocalorie',
            'nm': 'newton * meter',
            'ft lb': 'foot_pound',
            'foot-pound (energy)': 'foot_pound',
            'hertz': 'hertz',
            'kilohertz': 'kilohertz',
            'megahertz': 'megahertz',
            'gigahertz': 'gigahertz',
            'terahertz': 'terahertz',
            'hz': 'hertz',
            'khz': 'kilohertz',
            'mhz': 'megahertz',
            'ghz': 'gigahertz',
            'thz': 'terahertz',
            'rpm': 'rpm',
            'radian per second': 'radian / second',
            'rad/s': 'radian / second',
            'rad_per_s': 'radian / second',
            # Pressure Units
            'pascal': 'pascal',
            'kilopascal': 'kilopascal',
            'kpa': 'kilopascal', # Alias for Kilopascal
            'bar': 'bar',
            'psi': 'psi',
            'atmosphere': 'atmosphere',
            'atm': 'atmosphere', # Alias for Atmosphere
            'torr': 'torr',
            'kw': 'kilowatt',
            'hp': 'horsepower',
            'btu_per_hr': 'BTU/hour',
            'ton of refrigeration': 'ton_of_refrigeration'
        }
        
        pint_from_unit = pint_unit_mapping_aliases.get(cleaned_from_unit_str, unit_map.get(cleaned_from_unit_str, cleaned_from_unit_str))
        pint_to_unit = pint_unit_mapping_aliases.get(cleaned_to_unit_str, unit_map.get(cleaned_to_unit_str, cleaned_to_unit_str))
        
        if pint_from_unit not in ureg:
            pint_from_unit = cleaned_from_unit_str.replace(' ', '_').replace('-', '_')
        if pint_to_unit not in ureg:
            pint_to_unit = cleaned_to_unit_str.replace(' ', '_').replace('-', '_')

        quantity = Q_(value, pint_from_unit)
        converted_quantity = quantity.to(pint_to_unit)
        
        result_value = converted_quantity.magnitude
        
        if converter_type in ['digital_storage']:
            response_message = f"{result_value:,.2f}" 
        elif converter_type in ['energy', 'pressure', 'force', 'power', 'density']:
            response_message = f"{result_value:.4f}"
        elif converter_type == 'frequency':
            response_message = f"{result_value:.6f}"
        else:
            response_message = f"{result_value:.6f}"

        return jsonify({'result': response_message, 'status': 'success'})

    except UndefinedUnitError as e:
        app.logger.error(f"UndefinedUnitError: {e}", exc_info=True)
        return jsonify({'result': f"Error: Unit not recognized. Please check unit names. Details: {e}", 'status': 'error'}), 400
    except DimensionalityError as e:
        app.logger.error(f"DimensionalityError: {e}", exc_info=True)
        return jsonify({'result': f"Error: Cannot convert from {from_unit_str} to {to_unit_str}. Units are not compatible. Details: {e}", 'status': 'error'}), 400
    except Exception as e:
        app.logger.error(f"An unexpected error occurred during unit conversion: {e}", exc_info=True)
        return jsonify({'result': f"An unexpected error occurred during conversion: {e}", 'status': 'error'}), 500

# Backend API for Age Calculation
@app.route('/calculate_age', methods=['POST'])
def calculate_age_api():
    data = request.json
    dob_str = data.get('dob')

    if not dob_str:
        return jsonify({'result': 'Please provide a date of birth.', 'status': 'error'}), 400

    try:
        dob = datetime.datetime.strptime(dob_str, '%Y-%m-%d').date()
        today = datetime.date.today()

        if dob > today:
            return jsonify({'result': 'Date of Birth cannot be in the future.', 'status': 'error'}), 400

        years = today.year - dob.year
        months = today.month - dob.month
        days = today.day - dob.day

        if days < 0:
            months -= 1
            last_day_of_prev_month = (today.replace(day=1) - datetime.timedelta(days=1)).day
            days += last_day_of_prev_month
        
        if months < 0:
            months += 12
            years -= 1

        total_days = (today - dob).days
        total_hours = total_days * 24
        total_minutes = total_hours * 60
        total_seconds = total_minutes * 60
        total_weeks = total_days // 7

        total_months_approx = round(total_days / 30.4375)

        result_html = f"""
            <p><strong>You are:</strong></p>
            <ul>
                <li><b>{years}</b> years, <b>{months}</b> months, <b>{days}</b> days old (precise)</li>
                <li>Or approximately:</li>
                <li><b>{total_weeks:,}</b> weeks</li>
                <li><b>{int(total_months_approx):,}</b> months</li>
                <li><b>{total_days:,}</b> days</li>
                <li><b>{total_hours:,}</b> hours</li>
                <li><b>{total_minutes:,}</b> minutes</li>
                <li><b>{total_seconds:,}</b> seconds</li>
            </ul>
        """
        return jsonify({'result': result_html, 'status': 'success'})

    except ValueError:
        return jsonify({'result': 'Invalid date format. Please use ISO formatYYYY-MM-DD.', 'status': 'error'}), 400
    except Exception as e:
        app.logger.error(f"An unexpected error occurred during age calculation: {e}", exc_info=True)
        return jsonify({'result': f"An unexpected error occurred during age calculation: {e}", 'status': 'error'}), 500

if __name__ == '__main__':
    app.run(debug=True)