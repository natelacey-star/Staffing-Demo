interface MetricCardProps {
  label: string;
  beforeValue: string | number;
  afterValue: string | number;
  improvement?: string;
  unit?: string;
}

export default function MetricCard({ 
  label, 
  beforeValue, 
  afterValue, 
  improvement,
  unit = '' 
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
        {label}
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Before */}
        <div className="border-r border-gray-200 pr-4">
          <div className="text-xs text-gray-500 mb-1">Before</div>
          <div className="text-2xl font-bold text-gray-700">
            {beforeValue}{unit}
          </div>
        </div>

        {/* After */}
        <div className="pl-4">
          <div className="text-xs text-gray-500 mb-1">After</div>
          <div className="text-2xl font-bold gradient-text">
            {afterValue}{unit}
          </div>
        </div>
      </div>

      {improvement && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">{improvement}</span>
          </div>
        </div>
      )}
    </div>
  );
}
