import EditableZone from '@/components/inline-edit/EditableZone'
export default function MapPage() {
  return (
    <>
      <EditableZone page="destinations-carte" zone="seo_title" fallback="" />
      <EditableZone page="destinations-carte" zone="seo_description" fallback="" />
      <EditableZone page="destinations-carte" zone="seo_og_image" fallback="" />
    </>
  );
}
