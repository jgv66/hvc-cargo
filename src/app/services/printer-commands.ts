// commands based on https://github.com/humbertopiaia/escpos-commands-js/blob/master/src/commands.js
// all the commands below may vary by printer, check the manual
export const commands = {
  LF: '\x0a',
  ESC: '\x1b',
  FS: '\x1c',
  GS: '\x1d',
  US: '\x1f',
  FF: '\x0c',
  DLE: '\x10',
  DC1: '\x11',
  DC4: '\x14',
  EOT: '\x04',
  NUL: '\x00',
  EOL: '\n',
  HORIZONTAL_LINE: {
      HR_58MM: '================================',
      HR2_58MM: '********************************',
      HR3_58MM: '________________________________'
  },
  FEED_CONTROL_SEQUENCES: {
      CTL_LF: '\x0a', // Print and line feed
      CTL_FF: '\x0c', // Form feed
      CTL_CR: '\x0d', // Carriage return
      CTL_HT: '\x09', // Horizontal tab
      CTL_VT: '\x0b', // Vertical tab
  },
  LINE_SPACING: {
      LS_DEFAULT: '\x1b\x32',
      LS_SET: '\x1b\x33'
  },
  HARDWARE: {
      HW_INIT: '\x1b\x40', // Clear data in buffer and reset modes
      HW_SELECT: '\x1b\x3d\x01', // Printer select
      HW_RESET: '\x1b\x3f\x0a\x00', // Reset printer hardware
  },
  CASH_DRAWER: {
      CD_KICK_2: '\x1b\x70\x00', // Sends a pulse to pin 2 []
      CD_KICK_5: '\x1b\x70\x01', // Sends a pulse to pin 5 []
  },
  MARGINS: {
      BOTTOM: '\x1b\x4f', // Fix bottom size
      LEFT: '\x1b\x6c', // Fix left size
      RIGHT: '\x1b\x51', // Fix right size
  },
  PAPER: {
      PAPER_FULL_CUT: '\x1d\x56\x00', // Full cut paper
      PAPER_PART_CUT: '\x1d\x56\x01', // Partial cut paper
      PAPER_CUT_A: '\x1d\x56\x41', // Partial cut paper
      PAPER_CUT_B: '\x1d\x56\x42', // Partial cut paper
  },
  BARCODE: {
      BC_TXT_BELOW: '\x1d\x48\x02',      //  HRI barcode chars below
      BC_HEIGHT: '\x1d\x6b\x50',         // Set bar code height 50: PRINT #1, CHR$(&H1D);"h";CHR$(50);
      BC_POSITION: '\x1d\x48\x02',       // PRINT #1, CHR$(&H1D);"H";CHR$(2); ← Select printing position of HRI characters
      BC_FONT: '\x1d\x66\x01',           // PRINT #1, CHR$(&H1D);"f";CHR$(1); ← Select font for HRI characters
      BC_INIT: '\x1d\x6b\x69\x50',       // PRINT #1, CHR$(&H1D);"k";CHR$(4);"*00021*";CHR$(0); ← Print bar code39
      BC_END: '\x00',                    // PRINT #1, CHR$(&H1D);"k";CHR$(4);"*00021*";CHR$(0); ← Print bar code39
  },
  TEXT_FORMAT: {
      TXT_NORMAL: '\x1b\x21\x00', // Normal text
      TXT_2HEIGHT: '\x1b\x21\x10', // Double height text
      TXT_2WIDTH: '\x1b\x21\x20', // Double width text
      TXT_4SQUARE: '\x1b\x21\x30', // Double width & height text
      TXT_INVERTED_ON: '\x1d\x42\x01',
      TXT_INVERTED_OFF: '\x1d\x42\x00',
      TXT_CUSTOM_SIZE: (width, height) => { // other sizes
          const widthDec = (width - 1) * 16;
          const heightDec = height - 1;
          const sizeDec = widthDec + heightDec;
          return '\x1d\x21' + String.fromCharCode(sizeDec);
      },

      TXT_HEIGHT: {
          1: '\x00',
          2: '\x01',
          3: '\x02',
          4: '\x03',
          5: '\x04',
          6: '\x05',
          7: '\x06',
          8: '\x07'
      },
      TXT_WIDTH: {
          1: '\x00',
          2: '\x10',
          3: '\x20',
          4: '\x30',
          5: '\x40',
          6: '\x50',
          7: '\x60',
          8: '\x70'
      },

      TXT_UNDERL_OFF: '\x1b\x2d\x00', // Underline font OFF
      TXT_UNDERL_ON: '\x1b\x2d\x01', // Underline font 1-dot ON
      TXT_UNDERL2_ON: '\x1b\x2d\x02', // Underline font 2-dot ON
      TXT_BOLD_OFF: '\x1b\x45\x00', // Bold font OFF
      TXT_BOLD_ON: '\x1b\x45\x01', // Bold font ON
      TXT_ITALIC_OFF: '\x1b\x35', // Italic font ON
      TXT_ITALIC_ON: '\x1b\x34', // Italic font ON
      TXT_FONT_A: '\x1b\x4d\x00', // Font type A
      TXT_FONT_B: '\x1b\x4d\x01', // Font type B
      TXT_FONT_C: '\x1b\x4d\x02', // Font type C
      TXT_ALIGN_LT: '\x1b\x61\x00', // Left justification
      TXT_ALIGN_CT: '\x1b\x61\x01', // Centering
      TXT_ALIGN_RT: '\x1b\x61\x02', // Right justification
  },
};

// # Text formating
// TXT_NORMAL                   = [ 0x1b, 0x21, 0x00 ]        # Normal text
// TXT_2HEIGHT                  = [ 0x1b, 0x21, 0x10 ]        # Double height text
// TXT_2WIDTH                   = [ 0x1b, 0x21, 0x20 ]        # Double width text
// TXT_4SQUARE                  = [ 0x1b, 0x21, 0x30 ]        # Quad area text
// TXT_UNDERL_OFF               = [ 0x1b, 0x2d, 0x00 ]        # Underline font OFF
// TXT_UNDERL_ON                = [ 0x1b, 0x2d, 0x01 ]        # Underline font 1
// TXT_UNDERL2_ON               = [ 0x1b, 0x2d, 0x02 ]        # Underline font 2
// TXT_BOLD_OFF                 = [ 0x1b, 0x45, 0x00 ]        # Bold font OFF
// TXT_BOLD_ON                  = [ 0x1b, 0x45, 0x01 ]        # Bold font ON
// TXT_FONT_A                   = [ 0x1b, 0x4d, 0x00 ]        # Font type A
// TXT_FONT_B                   = [ 0x1b, 0x4d, 0x01 ]        # Font type B
// TXT_ALIGN_LT                 = [ 0x1b, 0x61, 0x00 ]        # Left justification
// TXT_ALIGN_CT                 = [ 0x1b, 0x61, 0x01 ]        # Centering
// TXT_ALIGN_RT                 = [ 0x1b, 0x61, 0x02 ]        # Right justification
// TXT_INVERT_ON                = [ 0x1d, 0x42, 0x01 ]        # Inverted color text
// TXT_INVERT_OFF               = [ 0x1d, 0x42, 0x00 ]        # Inverted color text
// TXT_COLOR_BLACK              = [ 0x1b, 0x72, 0x00 ]        # Default Color
// TXT_COLOR_RED                = [ 0x1b, 0x72, 0x01 ]        # Alternative Color (Usually Red)
//
//   # Barcodes
//   BARCODE_TXT_OFF             = [ 0x1d, 0x48, 0x00 ]         # HRI barcode chars OFF
//   BARCODE_TXT_ABV             = [ 0x1d, 0x48, 0x01 ]         # HRI barcode chars above
//   BARCODE_TXT_BLW             = [ 0x1d, 0x48, 0x02 ]         # HRI barcode chars below
//   BARCODE_TXT_BTH             = [ 0x1d, 0x48, 0x03 ]         # HRI barcode chars both above and below
//   BARCODE_FONT_A              = [ 0x1d, 0x66, 0x00 ]         # Font type A for HRI barcode chars
//   BARCODE_FONT_B              = [ 0x1d, 0x66, 0x01 ]         # Font type B for HRI barcode chars
//   BARCODE_HEIGHT              = [ 0x1d, 0x68 ]               # Barcode Height (1 - 255)
//   BARCODE_WIDTH               = [ 0x1d, 0x77 ]               # Barcode Width (2 - 6)
//   BARCODE_UPC_A               = [ 0x1d, 0x6b, 0x00 ]         # Barcode type UPC-A
//   BARCODE_UPC_E               = [ 0x1d, 0x6b, 0x01 ]         # Barcode type UPC-E
//   BARCODE_EAN13               = [ 0x1d, 0x6b, 0x02 ]         # Barcode type EAN13
//   BARCODE_EAN8                = [ 0x1d, 0x6b, 0x03 ]         # Barcode type EAN8
//   BARCODE_CODE39              = [ 0x1d, 0x6b, 0x04 ]         # Barcode type CODE39
//   BARCODE_ITF                 = [ 0x1d, 0x6b, 0x05 ]         # Barcode type ITF
//   BARCODE_NW7                 = [ 0x1d, 0x6b, 0x06 ]         # Barcode type NW7

 // Printing Density
 // public static final byte[] PD_N50          = {0x1d,0x7c,0x00}; // Printing Density -50%
 // public static final byte[] PD_N37          = {0x1d,0x7c,0x01}; // Printing Density -37.5%
 // public static final byte[] PD_N25          = {0x1d,0x7c,0x02}; // Printing Density -25%
 // public static final byte[] PD_N12          = {0x1d,0x7c,0x03}; // Printing Density -12.5%
 // public static final byte[] PD_0            = {0x1d,0x7c,0x04}; // Printing Density  0%
 // public static final byte[] PD_P50          = {0x1d,0x7c,0x08}; // Printing Density +50%
 // public static final byte[] PD_P37          = {0x1d,0x7c,0x07}; // Printing Density +37.5%
 // public static final byte[] PD_P25          = {0x1d,0x7c,0x06}; // Printing Density +25%
 // public static final byte[] PD_P12          = {0x1d,0x7c,0x05}; // Printing Density +12.5%
 //

//    '// --- Print barcode --->>>
// '// Select justification: Centering
//     ESC "a" 1
//     "<< Bonus points : 14 >>"
// '// Print and feed paper: Paper feeding amount = 4.94 mm (35/180 inches)
//     ESC "J" 35
// '// Set barcode height: in case TM-T20, 6.25 mm (50/203 inches)
//     GS "h" 50
// '// Select print position of HRI characters: Print position, below the barcode
//     GS "H" 2
// '// Select font for HRI characters: Font B
//     GS "f" 1
// '// Print barcode: (A) format, barcode system = CODE39
//     GS "k" 4 "*00014*" 0
// '// --- Print barcode ---<<<
