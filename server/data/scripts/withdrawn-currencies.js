import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import picocolors from 'picocolors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INPUT_FILE = '../src/datahub/flat-ui__data-Fri_Aug_22_2025.json';
const OUTPUT_FILE = '../src/datahub/withdrawn-currencies.json';

const parseWithdrawalDate = (dateString) => {
  if (!dateString) return null;
  
  // Handle various date formats that might exist in the data
  const cleanDate = dateString.trim();
  
  // Try to parse as YYYY-MM format first
  const yearMonthMatch = cleanDate.match(/^(\d{4})-(\d{1,2})$/);
  if (yearMonthMatch) {
    const year = parseInt(yearMonthMatch[1]);
    const month = parseInt(yearMonthMatch[2]);
    return new Date(year, month - 1); // JavaScript months are 0-indexed
  }
  
  // Try to parse as full date
  const date = new Date(cleanDate);
  return isNaN(date.getTime()) ? null : date;
};

const isInDateRange = (withdrawalDate) => {
  if (!withdrawalDate) return false;
  
  const startDate = new Date(2014, 11); // December 2014 (month 11 = December)
  const endDate = new Date(2025, 0); // January 2025 (month 0 = January)
  
  return withdrawalDate > startDate && withdrawalDate < endDate;
};

const processWithdrawnCurrencies = () => {
  try {
    console.log(picocolors.blue('🔍 Processing withdrawn currencies...'));
    
    // Read input file
    const inputPath = join(__dirname, INPUT_FILE);
    const rawData = readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);
    
    console.log(picocolors.gray(`📁 Input file: ${INPUT_FILE}`));
    console.log(picocolors.gray(`📊 Total records: ${data.length}`));
    
    // Filter currencies with WithdrawalDate in the specified range
    const withdrawnCurrencies = data.filter(currency => {
      const withdrawalDate = parseWithdrawalDate(currency.WithdrawalDate);
      return isInDateRange(withdrawalDate);
    });
    
    console.log(picocolors.green(`✅ Found ${withdrawnCurrencies.length} withdrawn currencies in date range`));
    
    // Deduplicate by entity, keeping only the one with the latest withdrawal date
    const latestByEntity = {};
    for (const currency of withdrawnCurrencies) {
      const entity = currency.Entity;
      const currentDate = parseWithdrawalDate(currency.WithdrawalDate);
      if (!latestByEntity[entity] || currentDate > parseWithdrawalDate(latestByEntity[entity].WithdrawalDate)) {
        latestByEntity[entity] = currency;
      }
    }
    const dedupedCurrencies = Object.values(latestByEntity);

    // Sort by withdrawal date for better organization
    dedupedCurrencies.sort((a, b) => {
      const dateA = parseWithdrawalDate(a.WithdrawalDate);
      const dateB = parseWithdrawalDate(b.WithdrawalDate);
      return dateA - dateB;
    });

    // Create output object with metadata
    const output = {
      metadata: {
        generatedAt: new Date().toISOString(),
        sourceFile: INPUT_FILE,
        dateRange: {
          after: '2014-12',
          before: '2025-01'
        },
        totalCount: dedupedCurrencies.length
      },
      currencies: dedupedCurrencies.map(currency => ({
        entity: currency.Entity,
        currency: currency.Currency,
        alphabeticCode: currency.AlphabeticCode,
        withdrawalDate: currency.WithdrawalDate,
        ...(currency.NumericCode && { numericCode: currency.NumericCode }),
        ...(currency.MinorUnit !== null && currency.MinorUnit !== undefined && { minorUnit: currency.MinorUnit })
      }))
    };
    
    // Write output file
    const outputPath = join(__dirname, OUTPUT_FILE);
    writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    
    console.log(picocolors.green(`💾 Output written to: ${OUTPUT_FILE}`));
    
    // Log some examples for verification
    if (withdrawnCurrencies.length > 0) {
      console.log(picocolors.yellow('\n📋 Sample withdrawn currencies:'));
      withdrawnCurrencies.slice(0, 5).forEach(currency => {
        console.log(picocolors.gray(
          `  ${currency.AlphabeticCode} (${currency.Entity}) - ${currency.WithdrawalDate}`
        ));
      });
      
      if (withdrawnCurrencies.length > 5) {
        console.log(picocolors.gray(`  ... and ${withdrawnCurrencies.length - 5} more`));
      }
    }
    
    console.log(picocolors.green('\n✨ Script completed successfully!'));
    
  } catch (error) {
    console.error(picocolors.red('❌ Error processing withdrawn currencies:'), error.message);
    process.exit(1);
  }
};

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  processWithdrawnCurrencies();
}

export { processWithdrawnCurrencies };
