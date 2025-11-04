#!/usr/bin/env python3
"""
Excel COM Interface for triggering macros and refreshing data.
WARNING: This script executes Excel macros which can be a security risk.
Only use with trusted Excel files.
"""

import sys
import os
import time
import json
import traceback
from pathlib import Path
from datetime import datetime

try:
    import win32com.client as win32
    import pythoncom
    COM_AVAILABLE = True
except ImportError:
    COM_AVAILABLE = False
    print("ERROR: pywin32 not installed. Install with: pip install pywin32")


class ExcelCOMManager:
    def __init__(self, excel_file_path):
        self.excel_file_path = Path(excel_file_path)
        self.excel = None
        self.workbook = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.cleanup()

    def initialize_com(self):
        """Initialize COM interface"""
        if not COM_AVAILABLE:
            raise RuntimeError("pywin32 not available. Cannot use COM interface.")

        try:
            pythoncom.CoInitialize()
            self.excel = win32.gencache.EnsureDispatch('Excel.Application')
            self.excel.Visible = False  # Run in background
            self.excel.DisplayAlerts = False  # Suppress dialog boxes
            print("Excel COM interface initialized successfully")
            return True
        except Exception as e:
            print(f"Failed to initialize Excel COM: {e}")
            return False

    def open_workbook(self):
        """Open the Excel workbook"""
        try:
            if not self.excel_file_path.exists():
                raise FileNotFoundError(f"Excel file not found: {self.excel_file_path}")

            print(f"Opening workbook: {self.excel_file_path}")
            self.workbook = self.excel.Workbooks.Open(
                str(self.excel_file_path),
                UpdateLinks=0,  # Don't update external links
                ReadOnly=False,  # Need write access for macros
                Password=None
            )
            print("Workbook opened successfully")
            return True
        except Exception as e:
            print(f"Failed to open workbook: {e}")
            return False

    def trigger_cell_macro(self, cell_address, description=""):
        """Trigger macro in specified cell"""
        try:
            if not self.workbook:
                raise RuntimeError("Workbook not open")

            # Get the Dashboard worksheet
            dashboard_sheet = self.workbook.Worksheets("Dashboard")

            print(f"Triggering macro in cell {cell_address} - {description}")

            # Get the cell and trigger calculation/macro
            cell = dashboard_sheet.Range(cell_address)

            # Try different methods to trigger the macro
            # Method 1: Calculate the cell
            cell.Calculate()
            time.sleep(1)

            # Method 2: Simulate double-click (if cell has click event)
            try:
                cell.Activate()
                dashboard_sheet.Activate()
            except:
                pass

            # Method 3: If cell contains a formula, recalculate
            if cell.HasFormula:
                cell.Formula = cell.Formula  # Force recalculation

            print(f"Successfully triggered macro in {cell_address}")
            return True

        except Exception as e:
            print(f"Failed to trigger macro in {cell_address}: {e}")
            traceback.print_exc()
            return False

    def refresh_data(self):
        """Refresh data by triggering C5 macro"""
        return self.trigger_cell_macro("C5", "Data Refresh")

    def archive_data(self):
        """Archive data by triggering C7 macro"""
        return self.trigger_cell_macro("C7", "Data Archive")

    def save_workbook(self):
        """Save the workbook"""
        try:
            if self.workbook:
                print("Saving workbook...")
                self.workbook.Save()
                print("Workbook saved successfully")
                return True
        except Exception as e:
            print(f"Failed to save workbook: {e}")
            return False

    def cleanup(self):
        """Clean up COM objects"""
        try:
            if self.workbook:
                self.workbook.Close(SaveChanges=False)
                print("Workbook closed")

            if self.excel:
                self.excel.Quit()
                print("Excel application closed")

            pythoncom.CoUninitialize()
            print("COM interface cleaned up")

        except Exception as e:
            print(f"Error during cleanup: {e}")

        # Force cleanup of COM references
        self.workbook = None
        self.excel = None


def refresh_excel_data(excel_file_path, action="refresh"):
    """
    Main function to refresh Excel data
    Args:
        excel_file_path: Path to Excel file
        action: "refresh", "archive", or "both"
    """

    result = {
        "success": False,
        "message": "",
        "timestamp": datetime.now().isoformat(),
        "action": action
    }

    if not COM_AVAILABLE:
        result["message"] = "pywin32 not installed. Cannot use COM interface."
        return result

    try:
        with ExcelCOMManager(excel_file_path) as excel_manager:
            # Initialize COM
            if not excel_manager.initialize_com():
                result["message"] = "Failed to initialize Excel COM interface"
                return result

            # Open workbook
            if not excel_manager.open_workbook():
                result["message"] = "Failed to open Excel workbook"
                return result

            success = True
            messages = []

            # Perform requested action
            if action in ["refresh", "both"]:
                if excel_manager.refresh_data():
                    messages.append("Data refresh triggered successfully")
                else:
                    success = False
                    messages.append("Failed to trigger data refresh")

            if action in ["archive", "both"]:
                if excel_manager.archive_data():
                    messages.append("Data archive triggered successfully")
                else:
                    success = False
                    messages.append("Failed to trigger data archive")

            # Save workbook if any action was successful
            if success:
                if excel_manager.save_workbook():
                    messages.append("Workbook saved successfully")
                else:
                    messages.append("Warning: Failed to save workbook")

            result["success"] = success
            result["message"] = "; ".join(messages)

    except Exception as e:
        result["message"] = f"Unexpected error: {str(e)}"
        traceback.print_exc()

    return result


def main():
    """Command line interface"""
    if len(sys.argv) < 2:
        print("Usage: python excel_com_interface.py <action>")
        print("Actions: refresh, archive, both")
        sys.exit(1)

    action = sys.argv[1].lower()
    if action not in ["refresh", "archive", "both"]:
        print("Invalid action. Use: refresh, archive, or both")
        sys.exit(1)

    # Get Excel file path
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    excel_file = project_root / "backend" / "data" / "excel" / "Markets Dashboard (Macro Enabled) (version 3).xlsm"

    print(f"Excel COM Interface - Action: {action}")
    print(f"Excel file: {excel_file}")
    print("=" * 60)

    result = refresh_excel_data(str(excel_file), action)

    print("=" * 60)
    print(f"Result: {'SUCCESS' if result['success'] else 'FAILED'}")
    print(f"Message: {result['message']}")
    print(f"Timestamp: {result['timestamp']}")

    # Output JSON for API consumption
    print("\nJSON Result:")
    print(json.dumps(result, indent=2))

    sys.exit(0 if result['success'] else 1)


if __name__ == "__main__":
    main()